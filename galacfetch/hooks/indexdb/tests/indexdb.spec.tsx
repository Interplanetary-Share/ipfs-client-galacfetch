import { renderHook, act } from '@testing-library/react-hooks'
import indexDbStore from '../indexdb'
import { TindexDbStore, ObjectStoresEnum } from '../types/common'
import 'fake-indexeddb/auto'

describe('indexDbStore', () => {
  let dbStore: TindexDbStore

  beforeAll(async () => {
    global.structuredClone = (val) => JSON.parse(JSON.stringify(val))

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
    const id = 'someId'
    const dataToAppend = { key: 'value' }

    await act(async () => {
      await expect(
        dbStore.saveData(id, dataToAppend, ObjectStoresEnum.files)
      ).resolves.not.toThrow()
    })
  })
  it('retrieve data from the store', async () => {
    const id = 'someId'
    const dataToAppend = { key: 'value' }

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
    const tableName = ObjectStoresEnum.files
    const id = 'someId'
    const dataToAppend = { key: 'value' }

    await act(async () => {
      await expect(
        dbStore.saveData(id, dataToAppend, tableName)
      ).resolves.not.toThrow()
    })

    await act(async () => {
      await expect(dbStore.removeData(id, tableName)).resolves.not.toThrow()
    })

    let retrievedData
    await act(async () => {
      retrievedData = await dbStore.getData(id, tableName)
    })

    expect(retrievedData).toBeUndefined() // o null, dependiendo de cómo tu método getData maneje los elementos no encontrados
  })

  it('retrieve all keys from the store', async () => {
    const tableName = ObjectStoresEnum.files
    const id = 'someId'
    const dataToAppend = { key: 'value' }

    await act(async () => {
      await expect(
        dbStore.saveData(id, dataToAppend, tableName)
      ).resolves.not.toThrow()
    })

    let allKeys
    await act(async () => {
      allKeys = await dbStore.getAllKeys(tableName)
    })

    expect(allKeys).toContain(id)
  })
})
