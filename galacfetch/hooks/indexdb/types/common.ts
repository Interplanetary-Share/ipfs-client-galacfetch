export enum objectStoresEnum {
  files = 'files',
}

export const objectStores = {
  files: objectStoresEnum.files,
}

export type TindexDbStore = {
  status: 'iddle' | 'loading' | 'error' | null
  iDb: IDBDatabase | null
  initIndexedDb: (dbName: string) => Promise<IDBDatabase>
  saveData: (
    id: string,
    dataToAppend: object,
    tableName: objectStoresEnum
  ) => Promise<void>
  getData: (id: string, tableName: objectStoresEnum) => Promise<any>
  removeData: (id: string, tableName: objectStoresEnum) => Promise<void>
  getAllKeys: (tableName: string) => Promise<IDBValidKey[] | undefined>
}
