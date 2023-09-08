import { create } from 'zustand';
import { objectStores } from './types/idb';

type Store = {
  status: 'iddle' | 'loading' | 'error' | null;
  iDb: IDBDatabase | null;
  initIndexedDb: (dbName: string) => void;
  saveData: (id: string, dataToAppend: object, tableName: string) => void;
  getData: (id: string, tableName: string) => Promise<any>;
  removeData: (id: string, tableName: string) => Promise<any>;
  getAllKeys: (tableName: string) => Promise<IDBValidKey[] | undefined>;
};

const indexDbStore = create<Store>()(
  (set): Store => ({
    status: null,
    initIndexedDb: (dbName) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = function () {
        console.log('all good');
        set({ iDb: request.result });
      };
      // Run migrations
      request.onupgradeneeded = function (event: any) {
        if (event && event.target && event.target.result) {
          const db = event?.target?.result;
          db.createObjectStore(objectStores.files);
        }
      };
    },
    iDb: null,
    saveData: (id, dataToAppend, tableName) => {
      const { iDb } = indexDbStore.getState();
      if (!iDb) return;
      console.log('saving data');
      const transaction = iDb.transaction([tableName], 'readwrite');
      const tableItem = transaction.objectStore(tableName);
      console.log(`fastlog => tableItem:`, tableItem);
      console.log('fastlog => id:', id);
      console.log('fastlog => id2:', btoa(id));
      const request = tableItem.put(dataToAppend, id);
      console.log(`fastlog => request:`, request);
      request.onsuccess = function () {
        console.log('Data Saved Propertly => ', request.result);
      };
    },
    getData: async (id, tableName) => {
      const { iDb } = indexDbStore.getState();
      if (!iDb) return;
      const transaction = iDb.transaction([tableName], 'readwrite');
      if (!transaction.objectStoreNames.contains(tableName)) {
        transaction.db.createObjectStore(tableName, { keyPath: 'id' });
      }
      const tableItem = transaction.objectStore(tableName);
      const request = tableItem.get(id);
      request.onsuccess = function () {
        console.log('Data Loaded Propertly => ', request.result);
      };
      return new Promise((resolve) => {
        request.onsuccess = function () {
          resolve(request.result);
        };
      });
    },
    removeData: async (id, tableName) => {
      const { iDb } = indexDbStore.getState();
      if (!iDb) return;
      const transaction = iDb.transaction([tableName], 'readwrite');
      const tableItem = transaction.objectStore(tableName);
      const request = tableItem.delete(id);

      return new Promise((resolve) => {
        request.onsuccess = function () {
          resolve(request.result);
        };
      });
    },
    getAllKeys: async (tableName) => {
      const { iDb } = indexDbStore.getState();
      if (!iDb) return;
      const transaction = iDb.transaction([tableName], 'readwrite');
      const tableItem = transaction.objectStore(tableName);
      const request = tableItem.getAllKeys();
      request.onsuccess = function () {
        console.log('Data Loaded Propertly => ', request.result);
      };
      return new Promise((resolve, reject) => {
        request.onsuccess = function () {
          resolve(request.result);
        };
        // handle errors
        request.onerror = function () {
          reject(request.error);
        };
      });
    },
  })
);

export default indexDbStore;
