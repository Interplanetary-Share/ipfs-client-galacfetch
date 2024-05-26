export enum ObjectStoresEnum {
  files = 'files',
  stats = 'stats',
}

export type TStats = {
  size: number
}

export type TConfig = {
  maxSizeByTable: number | undefined
  garbageCollector: {
    enabled: boolean
    interval: number
    strategy: 'lru'
  }
}

export interface TindexDbStore {
  config: TConfig
  setConfig: (newConfig: Partial<TConfig>) => void

  status: 'iddle' | 'loading' | 'error' | null
  iDb: IDBDatabase | null
  initIndexedDb: (dbName: string) => Promise<IDBDatabase>
  saveData: (
    id: string,
    dataToAppend: object,
    tableName: ObjectStoresEnum
  ) => Promise<void>
  getData: (id: string, tableName: ObjectStoresEnum) => Promise<any>
  removeData: (id: string, tableName: ObjectStoresEnum) => Promise<void>
  getAllKeys: (tableName: string) => Promise<IDBValidKey[] | undefined>
  getTableStats: (tableName: string) => Promise<TStats>
  checkGarbageCollector: () => Promise<void>
}
