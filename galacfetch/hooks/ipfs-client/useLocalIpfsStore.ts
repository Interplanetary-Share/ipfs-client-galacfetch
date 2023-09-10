// TODO implement webrtc to share data between peers to avoid the use of a centralized database.
import { create } from 'zustand';
import indexDbStore from './indexDb';
import { ipfsGalactFetchClient } from './ipfsGalactFetchClient';
import { objectStores } from './types/idb';
import { useRemoteIpfsClient } from './useRemoteIpfsClient';
import {
  chunkBlobToBuffer,
  fileToBlobUrl,
  isFilePreloaded,
} from './utils/file';
type Store = {
  localGetFile: (cid: string) => Promise<string | undefined>;
  localAddFile: (blob: Blob, cid: string) => Promise<string | undefined>;
  localRemoveFile: (cid: string) => Promise<boolean>;
  localGetAllFiles: (cid: string) => Promise<string[] | undefined>;
};

export const useLocalIpfsStore = create<Store>(
  (set): Store => ({
    localGetFile: async (cid: string) => {
      const {
        addNewBlobUrl,
        remoteCheckIntegrityFile,
        remoteRestoreIntegrityFile,
      } = useRemoteIpfsClient.getState();
      const { urlFileList } = ipfsGalactFetchClient.getState();
      const { iDb, getData } = indexDbStore.getState();
      if (!cid) throw new Error('no cid provided');
      if (!iDb) throw new Error('Indexed DB not initialized');
      if (isFilePreloaded(urlFileList, cid))
        return urlFileList.find((fileLs) => fileLs.cid === cid)?.url;

      const fileBlobList = [] as any;
      const fileData = await getData(cid, objectStores.files);

      if (!fileData) return undefined;
      let chunkSize = 0;
      fileData.buffers.forEach((chunk) => {
        chunkSize += chunk.length;
        const buffer = Buffer.from(chunk);
        const blob = new Blob([buffer]);
        fileBlobList.push(blob);
      });
      const blob = new Blob(fileBlobList);
      const url = fileToBlobUrl(blob);
      addNewBlobUrl({
        cid,
        url,
      });
      const isFileGoodIntegrity = await remoteCheckIntegrityFile(cid);
      if (!isFileGoodIntegrity) {
        remoteRestoreIntegrityFile(blob, cid);
      }

      return url;
    },
    localAddFile: async (blob: Blob, cid: string) => {
      if (!blob) throw new Error('no blob provided');
      if (!cid) throw new Error('no cid provided');
      const { iDb, saveData } = indexDbStore.getState();
      const { addNewBlobUrl } = useRemoteIpfsClient.getState();
      if (!iDb) throw new Error('Indexed DB not initialized');
      const buffersChunked = await chunkBlobToBuffer(blob);
      saveData(cid, { buffers: buffersChunked }, objectStores.files);
      const url = fileToBlobUrl(new Blob([blob]));
      addNewBlobUrl({
        cid,
        url,
      });

      return cid;
    },
    localRemoveFile: async (cid: string) => {
      if (!cid) throw new Error('no cid provided');
      const { iDb, removeData } = indexDbStore.getState();
      if (!iDb) throw new Error('Indexed DB not initialized');
      return await removeData(cid, objectStores.files);
    },
    localGetAllFiles: async () => {
      const { iDb, getAllKeys } = indexDbStore.getState();
      if (!iDb) throw new Error('Indexed DB not initialized');
      const localPinnedFiles = [] as string[];
      const allKeys = await getAllKeys(objectStores.files);
      if (!allKeys) return undefined;
      allKeys.forEach((key) => {
        localPinnedFiles.push(key as string);
      });
      return localPinnedFiles;
    },
  })
);
