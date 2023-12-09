import { create } from 'zustand'
import { TindexDbStore, ObjectStoresEnum } from '../types/common'

const indexDbStore = create<TindexDbStore>()(
  (set): TindexDbStore => ({
    status: null,
    initIndexedDb: async (dbName) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName)

        request.onsuccess = () => {
          console.info('IndexedDB initialized')
          set({ iDb: request.result })
          resolve(request.result)
        }

        request.onerror = (event) => {
          console.error('Error initializing IndexedDB', event)
          reject(event)
        }

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          db.createObjectStore(ObjectStoresEnum.files)
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

      try {
        const transaction = iDb.transaction([tableName], 'readwrite')
        const tableItem = transaction.objectStore(tableName)

        await new Promise<void>((resolve, reject) => {
          const request = tableItem.put(dataToAppend, id)

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
  })
)

export default indexDbStore
