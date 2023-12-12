import { calculateSizeFromObject } from '@intershare/utils.general'
import { create } from 'zustand'
import { TConfig, TindexDbStore } from './types/common'
import { ObjectStoresEnum } from './types/enum'

const indexDbStore = create<TindexDbStore>()(
  (set): TindexDbStore => ({
    config: {
      maxSizeByTable: undefined,
      garbageCollector: {
        enabled: true,
        interval: 60000, // 1 minute
        strategy: 'lru',
      },
    },
    setConfig: (newConfig: Partial<TConfig>) => {
      set((prevState) => ({
        config: {
          ...prevState.config,
          ...newConfig, // Aplica las nuevas configuraciones
          garbageCollector: {
            ...prevState.config.garbageCollector, // Mantén las configuraciones existentes de garbageCollector
            ...newConfig.garbageCollector, // Aplica solo los cambios en garbageCollector
          },
        },
      }))
    },
    status: null,
    initIndexedDb: async (dbName) => {
      const { config, checkGarbageCollector } = indexDbStore.getState()
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName)

        request.onsuccess = () => {
          console.info('IndexedDB initialized')
          const db = request.result
          set({ iDb: db })
          resolve(db)

          if (config.garbageCollector.enabled) {
            setInterval(() => {
              checkGarbageCollector()
            }, config.garbageCollector.interval)
          }
        }

        request.onerror = (event) => {
          console.error('Error initializing IndexedDB', event)
          reject(event)
        }

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result

          Object.values(ObjectStoresEnum).forEach((tableName) => {
            if (!db.objectStoreNames.contains(tableName)) {
              db.createObjectStore(tableName)
            }
          })
        }
      })
    },
    iDb: null,
    saveData: async (
      id: string,
      dataToAppend: object,
      tableName: ObjectStoresEnum
    ): Promise<void> => {
      const { iDb } = indexDbStore.getState()
      if (!iDb) {
        console.error('IndexedDB no está inicializado')
        return
      }
      if (!id) {
        console.error('No se proporcionó ID')
        return
      }
      if (!tableName) {
        console.error('No se proporcionó nombre de tabla')
        return
      }
      if (tableName === ObjectStoresEnum.stats) {
        console.error('No se puede guardar en la tabla stats')
      }

      try {
        const transaction = iDb.transaction(
          [tableName, ObjectStoresEnum.stats],
          'readwrite'
        )
        const tableItem = transaction.objectStore(tableName)
        const statsItem = transaction.objectStore(ObjectStoresEnum.stats)

        await new Promise<void>((resolve, reject) => {
          const request = tableItem.put(dataToAppend, id)

          const statsRequest = statsItem.get(tableName)
          statsRequest.onsuccess = () => {
            const previousSize = statsRequest.result?.size || 0
            const newSize = previousSize + calculateSizeFromObject(dataToAppend)
            const statsRequest2 = statsItem.put({ size: newSize }, tableName)
            statsRequest2.onsuccess = () => {
              console.log('stats updated')
            }
          }

          request.onsuccess = () => resolve()
          request.onerror = () => {
            console.error(
              'Error al guardar los datos en IndexedDB',
              request.error
            )
            reject(request.error)
          }
        })

        console.info('Datos guardados con éxito')
      } catch (error) {
        console.error('Error durante la transacción de IndexedDB', error)
      }
    },
    getData: async (id: string, tableName: ObjectStoresEnum) => {
      const { iDb } = indexDbStore.getState()
      if (!iDb) {
        console.error('iDb not initialized')
        throw new Error('IndexedDB no está inicializado')
      }
      if (!id) {
        console.error('no id provided')
        throw new Error('No se proporcionó ID')
      }
      if (!tableName) {
        console.error('no tableName provided')
        throw new Error('No se proporcionó nombre de tabla')
      }

      try {
        const transaction = iDb.transaction([tableName], 'readonly')
        const tableItem = transaction.objectStore(tableName)

        return await new Promise((resolve, reject) => {
          const request = tableItem.get(id)

          request.onsuccess = () => resolve(request.result)
          request.onerror = () => {
            console.error('Error al obtener datos de IndexedDB', request.error)
            reject(request.error)
          }
        })
      } catch (error) {
        console.error('Error durante la transacción de IndexedDB', error)
        throw error
      }
    },
    removeData: async (id, tableName) => {
      const { iDb } = indexDbStore.getState()
      if (!iDb) {
        console.error('IndexedDB no está inicializado')
        throw new Error('IndexedDB no está inicializado')
      }

      if (!id) {
        console.error('No se proporcionó ID')
        throw new Error('No se proporcionó ID')
      }

      if (!tableName) {
        console.error('No se proporcionó nombre de tabla')
        throw new Error('No se proporcionó nombre de tabla')
      }

      try {
        const transaction = iDb.transaction([tableName], 'readwrite')
        const tableItem = transaction.objectStore(tableName)

        return await new Promise((resolve, reject) => {
          const request = tableItem.delete(id)

          request.onsuccess = () => resolve(request.result)
          request.onerror = () => {
            console.error('Error al eliminar datos de IndexedDB', request.error)
            reject(request.error)
          }
        })
      } catch (error) {
        console.error('Error durante la transacción de IndexedDB', error)
        throw error
      }
    },

    getAllKeys: async (tableName) => {
      const { iDb } = indexDbStore.getState()
      if (!iDb) {
        console.error('IndexedDB no está inicializado')
        throw new Error('IndexedDB no está inicializado')
      }

      if (!tableName) {
        console.error('No se proporcionó nombre de tabla')
        throw new Error('No se proporcionó nombre de tabla')
      }

      try {
        const transaction = iDb.transaction([tableName], 'readonly')
        const tableItem = transaction.objectStore(tableName)
        const request = tableItem.getAllKeys()

        return await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => {
            console.error(
              'Error al obtener todas las claves de IndexedDB',
              request.error
            )
            reject(request.error)
          }
        })
      } catch (error) {
        console.error('Error durante la transacción de IndexedDB', error)
        throw error
      }
    },

    getTableStats: async (tableName) => {
      const { iDb } = indexDbStore.getState()
      if (!iDb) {
        console.error('IndexedDB no está inicializado')
        throw new Error('IndexedDB no está inicializado')
      }

      if (!tableName) {
        console.error('No se proporcionó nombre de tabla')
        throw new Error('No se proporcionó nombre de tabla')
      }

      try {
        const transaction = iDb.transaction(
          [ObjectStoresEnum.stats],
          'readonly'
        )
        const tableItem = transaction.objectStore(ObjectStoresEnum.stats)
        const request = tableItem.get(tableName)

        return await new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => {
            console.error(
              'Error al obtener las estadísticas de la tabla de IndexedDB',
              request.error
            )
            reject(request.error)
          }
        })
      } catch (error) {
        console.error('Error durante la transacción de IndexedDB', error)
        throw error
      }
    },
    checkGarbageCollector: async () => {
      const { config, getAllKeys, removeData, getTableStats } =
        indexDbStore.getState()
      if (!config.garbageCollector.enabled) {
        return
      }

      const tables = Object.values(ObjectStoresEnum)
      for (const table of tables) {
        if (table === ObjectStoresEnum.stats) {
          continue
        }

        const stats = await getTableStats(table)
        if (!stats) {
          continue
        }

        const avalableMaxSize =
          config.maxSizeByTable ||
          (await navigator.storage
            .estimate()
            .then((estimate) => estimate.quota)) ||
          1000000000 // 1GB

        if (avalableMaxSize < stats.size) {
          const keys = await getAllKeys(table)
          if (!keys) {
            continue
          }

          const keyToRemove = keys[0]
          await removeData(keyToRemove as string, table)
        }
      }
    },
  })
)

export default indexDbStore
