import { renderHook, act } from '@testing-library/react-hooks'
import indexDbStore from '../src/indexdb'
import 'fake-indexeddb/auto'
import { TStats, TindexDbStore } from '../src/types/common'
import { ObjectStoresEnum } from '../src/types/enum'

describe('indexDbStore', () => {
  const id = 'someId'
  const dataToAppend = { key: 'value' }

  let dbStore: TindexDbStore

  beforeAll(async () => {
    globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val))

    const { result, waitForNextUpdate } = renderHook(() => indexDbStore())
    dbStore = result.current
    await act(async () => {
      dbStore.initIndexedDb('test')
      await waitForNextUpdate()
    })
  })

  it('init db test store', async () => {
    const dbName = 'test'
    await act(async () => {
      const response = dbStore.initIndexedDb(dbName)
      await expect(response).resolves.not.toThrowError()
    })
  })
  it('save data to the store', async () => {
    await act(async () => {
      await expect(
        dbStore.saveData(id, dataToAppend, ObjectStoresEnum.files)
      ).resolves.not.toThrow()
    })
  })
  it('retrieve data from the store', async () => {
    await act(async () => {
      await expect(
        dbStore.saveData(id, dataToAppend, ObjectStoresEnum.files)
      ).resolves.not.toThrow()
    })

    let retrievedData
    await act(async () => {
      retrievedData = await dbStore.getData(id, ObjectStoresEnum.files)
    })
    expect(retrievedData).toEqual(dataToAppend)
  })

  it('remove data from the store', async () => {
    await act(async () => {
      await expect(
        dbStore.saveData(id, dataToAppend, ObjectStoresEnum.files)
      ).resolves.not.toThrow()
    })

    await act(async () => {
      await expect(
        dbStore.removeData(id, ObjectStoresEnum.files)
      ).resolves.not.toThrow()
    })

    let retrievedData
    await act(async () => {
      retrievedData = await dbStore.getData(id, ObjectStoresEnum.files)
    })

    expect(retrievedData).toBeUndefined() // o null, dependiendo de cómo tu método getData maneje los elementos no encontrados
  })

  it('retrieve all keys from the store', async () => {
    await act(async () => {
      await expect(
        dbStore.saveData(id, dataToAppend, ObjectStoresEnum.files)
      ).resolves.not.toThrow()
    })

    let allKeys
    await act(async () => {
      allKeys = await dbStore.getAllKeys(ObjectStoresEnum.files)
    })

    expect(allKeys).toContain(id)
  })

  it('get the table stats in bytes', async () => {
    await act(async () => {
      await expect(
        dbStore.saveData(id, dataToAppend, ObjectStoresEnum.files)
      ).resolves.not.toThrow()
    })

    let tableStats: TStats
    await act(async () => {
      tableStats = await dbStore.getTableStats(ObjectStoresEnum.files)
      expect(tableStats.size).toBeGreaterThanOrEqual(15)
    })
  })

  it('check garbage collection', async () => {
    await act(async () => {
      await expect(
        dbStore.saveData(id, dataToAppend, ObjectStoresEnum.files)
      ).resolves.not.toThrow()
    })

    await act(async () => {
      dbStore.setConfig({
        maxSizeByTable: 1,
      })
    })

    let retrievedData
    await act(async () => {
      retrievedData = await dbStore.getData(id, ObjectStoresEnum.files)
      expect(retrievedData).toEqual(dataToAppend)
    })

    // Check that the data is removed after garbage collection
    await act(async () => {
      await expect(dbStore.checkGarbageCollector()).resolves.not.toThrow()
    })

    await act(async () => {
      retrievedData = await dbStore.getData(id, ObjectStoresEnum.files)
      expect(retrievedData).toBeUndefined()
    })
  })
})
