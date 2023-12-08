export enum ObjectStoresEnum {
  files = 'files',
}

export const objectStores = {
  files: ObjectStoresEnum.files,
}

export type TindexDbStore = {
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
}
