import { create } from 'zustand';
import { fileToBlobUrl, isFilePreloaded, loadScript } from './utils/file';
import { useRemoteIpfsClient } from './useRemoteIpfsClient';
import { ipfsGalactFetchClient } from './ipfsGalactFetchClient';
type Store = {
  ipfs: any;
  initIpfs: (repoName: string) => Promise<void>;
  localCheckIsFile: (cid: string) => Promise<Boolean>;
  localGetFile: (cid: string) => Promise<string | undefined>;
  localAddFile: (blob: Blob) => Promise<string | undefined>;
  localRemoveFile: (cid: string) => Promise<void>;
  localGetAllFiles: (cid: string) => Promise<string[] | undefined>;
};

export const useLocalIpfsStore = create<Store>(
  (set): Store => ({
    ipfs: null,
    initIpfs: async (repoName: string) => {
      console.time('ipfsInit');
      await loadScript(
        'https://cdn.jsdelivr.net/npm/ipfs-core/dist/index.min.js'
      );

      const config = {
        repo: repoName,
        config: {
          Addresses: {},
          Datastore: {
            StorageMax: '10GB',
            StorageGCWatermark: 90,
            GCPeriod: '1h',
            HashOnRead: false,
            BloomFilterSize: 0,
          },
          Pinning: {
            EnableGC: true,
          },
          Relay: {
            Enabled: true,
          },
          Experimental: {
            FilestoreEnabled: true,
            ShardingEnabled: true,
            Libp2pStreamMounting: true,
            QUIC: true,
            UrlstoreEnabled: true,
          },
          Peering: {},
        },
      };

      const windowObj = window as any;
      if (!windowObj.IpfsCore) return console.log('IPFS Core not imported');
      const ipfs = await windowObj.IpfsCore.create(config);
      if (!ipfs) console.log('ipfs not initialized');

      console.log(`fastlog => ipfs:`, ipfs);

      set({ ipfs });
      console.timeEnd('ipfsInit');
    },
    localCheckIsFile: async (cid) => {
      if (!cid) throw new Error('no cid provided');
      const { ipfs } = useLocalIpfsStore.getState();
      if (!ipfs) throw new Error('ipfs not initialized');
      let isFileInLocalIpfs = false;

      const getFirstByte = ipfs.cat(cid, {
        // timeout: 300, // 10 seconds to check // 5 seems to be enough but slow, debug in 100ms
        // timeout: 1000, // 10 seconds to check // 5 seems to be enough but slow, debug in 100ms
        timeout: 2000, // 10 seconds to check // 5 seems to be enough but slow, debug in 100ms
        offset: 0,
        length: 1,
      });

      for await (const chunk of getFirstByte) {
        isFileInLocalIpfs = true;
        break;
      }

      return isFileInLocalIpfs;
    },
    localGetFile: async (cid: string) => {
      const {
        addNewBlobUrl,
        remoteCheckIntegrityFile,
        remoteRestoreIntegrityFile,
      } = useRemoteIpfsClient.getState();

      const { urlFileList } = ipfsGalactFetchClient.getState();

      if (!cid) throw new Error('no cid provided');
      if (isFilePreloaded(urlFileList, cid)) return undefined;
      const { ipfs } = useLocalIpfsStore.getState();
      if (!ipfs) throw new Error('ipfs not initialized');

      const fileBlobList = [] as any;
      const ipfsAsyncIterator = ipfs.cat(cid);
      let chunkSize = 0;

      for await (const chunk of ipfsAsyncIterator) {
        chunkSize += chunk.length;
        const buffer = Buffer.from(chunk);
        const blob = new Blob([buffer]);
        fileBlobList.push(blob);
      }

      const blob = new Blob(fileBlobList);

      const url = fileToBlobUrl(blob);
      addNewBlobUrl({
        cid,
        url,
      });

      const isFileGoodIntegrity = await remoteCheckIntegrityFile(cid);

      if (isFileGoodIntegrity) {
        remoteRestoreIntegrityFile(blob, cid);
      }

      return url;
    },
    localAddFile: async (blob: Blob) => {
      if (!blob) throw new Error('no blob provided');

      const { ipfs } = useLocalIpfsStore.getState();
      const { addNewBlobUrl } = useRemoteIpfsClient.getState();
      if (!ipfs) throw new Error('ipfs not initialized');

      const infoFile = await ipfs
        .add(blob, {
          chunker: 'size-6000000', // Best performance for large files
          onlyHash: false,
          pin: true,
          wrapWithDirectory: false,
        })
        .catch((err: any) => {
          console.log(`fastlog => err:`, err);
          return undefined;
        });

      if (!infoFile) return undefined;
      const cid = infoFile.cid?.toString();

      const url = fileToBlobUrl(new Blob([blob]));
      addNewBlobUrl({
        cid,
        url,
      });

      return cid;
    },
    localRemoveFile: async (cid: string) => {
      if (!cid) throw new Error('no cid provided');
      const { ipfs } = useLocalIpfsStore.getState();
      if (!ipfs) throw new Error('ipfs not initialized');

      await ipfs.files.rm(cid, { recursive: true });
      await ipfs.pin.rm(cid, { recursive: true });
    },
    localGetAllFiles: async () => {
      const { ipfs } = useLocalIpfsStore.getState();
      if (!ipfs) throw new Error('ipfs not initialized');
      const localPinnedFiles = [] as string[];
      for await (const file of ipfs.pin.ls('/')) {
        const cid = file.cid?.toString();
        if (cid) localPinnedFiles.push(cid);
      }
      return localPinnedFiles;
    },
  })
);
