import { create } from 'zustand';
import { isFilePreloaded } from './utils/file';
type Store = {
  // ipfs: any;
  init: (api: string, repoName: string) => Promise<void>;
  // localCheckIsFile: (cid: string) => Promise<Boolean>;
  // localGetFile: (cid: string) => Promise<string | undefined>;
  // localAddFile: (blob: Blob) => Promise<string | undefined>;
  // localRemoveFile: (cid: string) => Promise<void>;
  // localGetAllFiles: (cid: string) => Promise<string[] | undefined>;
};

export const useIpfsStore = create<Store>((set) => ({
  ws: [],
  init: async (api, repoName) => {
    // Inicializa el ipfs Local,
    // Llama a VerifyApiToken
    // Setea los ws list a escuchar para descargar.
  },
  remoteCheckIsFile: async (cid, serverName) => {
    if (!cid) throw new Error('no cid provided');
    const { ipfs } = useIpfsStore.getState();
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
    // TODO:  we need to get the urlList updated.
    if (!cid) throw new Error('no cid provided');
    const urlList = [];
    if (isFilePreloaded(urlList, cid)) return undefined;
    const { ipfs } = useIpfsStore.getState();
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

    const href = URL.createObjectURL(blob);

    // TODO: we need to add this file to the urlList in blobk format.
    // TODO: we need to update file to the server if not found.

    return href;
  },
  localAddFile: async (blob: Blob) => {
    if (!blob) throw new Error('no blob provided');

    const { ipfs } = useIpfsStore.getState();
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

    return cid;
  },
  localRemoveFile: async (cid: string) => {
    if (!cid) throw new Error('no cid provided');
    const { ipfs } = useIpfsStore.getState();
    if (!ipfs) throw new Error('ipfs not initialized');

    await ipfs.files.rm(cid, { recursive: true });
    await ipfs.pin.rm(cid, { recursive: true });
  },
  localGetAllFiles: async () => {
    const { ipfs } = useIpfsStore.getState();
    if (!ipfs) throw new Error('ipfs not initialized');
    const localPinnedFiles = [] as string[];
    for await (const file of ipfs.pin.ls('/')) {
      const cid = file.cid?.toString();
      if (cid) localPinnedFiles.push(cid);
    }
    return localPinnedFiles;
  },
}));
