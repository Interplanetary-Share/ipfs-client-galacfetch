import { create } from 'zustand';
import { useLocalIpfsStore } from './useLocalIpfsStore';
import { FileProps, useRemoteIpfsClient } from './useRemoteIpfsClient';

export interface UrlFileList {
  url: string;
  cid: string;
}

export interface getFileConfig {
  showBlobUrl?: boolean;
  showInfoFile?: boolean;
  showExtraProps?: boolean;
}

type Store = {
  status: undefined | 'idle' | 'loading';
  init: (api: string, repoName: string) => Promise<void>;
  getFile: (cid: string, config?: getFileConfig) => Promise<any>; //TODO add response promises
  getFiles: () => Promise<void>;
  uploadFile: (
    file: File,
    fileProps: FileProps,
    alias?: string
  ) => Promise<string | undefined>;
  urlFileList: UrlFileList[];
  findPreloadFile: (cid: string) => UrlFileList | undefined;
};

export const ipfsGalactFetchClient = create<Store>((set) => ({
  status: undefined,
  init: async (api: string, repoName = 'galactfetch') => {
    const { init } = useRemoteIpfsClient.getState();
    set({ status: 'loading' });
    const response = await init(api, repoName);
    set({ status: 'idle' });
    return response;
  },
  urlFileList: [],
  // TODO: eliminar el token de todas las respuestas posibles de archivos.
  getFile: async (
    cid,
    config = {
      showBlobUrl: true,
      showInfoFile: true,
      showExtraProps: true,
    }
  ) => {
    const { api } = useRemoteIpfsClient.getState();
    if (!api) throw new Error('no api provided');
    set({ status: 'loading' });

    const { localCheckIsFile, localGetFile } = useLocalIpfsStore.getState();
    const { remoteGetFile, remotegetFileExtraProps, remoteGetFileInfo } =
      useRemoteIpfsClient.getState();
    const { findPreloadFile } = ipfsGalactFetchClient.getState();

    const isFile = await localCheckIsFile(cid);

    if (isFile) {
      await localGetFile(cid);
    } else {
      await remoteGetFile(cid);
    }

    const url = config.showBlobUrl ? findPreloadFile(cid)?.url : undefined;
    const info = config.showInfoFile ? await remoteGetFileInfo(cid) : undefined;
    const extraProps = config.showExtraProps
      ? await remotegetFileExtraProps(cid)
      : undefined;

    set({ status: 'idle' });

    return {
      url,
      info,
      extraProps,
    };
  },

  findPreloadFile: (cid: string) => {
    set({ status: 'loading' });
    const { urlFileList } = ipfsGalactFetchClient.getState();
    set({ status: 'idle' });
    return urlFileList.find((file) => file.cid === cid);
  },

  // TODO - Add pagination
  getFiles: async () => {
    set({ status: 'loading' });
    const { api } = useRemoteIpfsClient.getState();
    if (!api) throw new Error('no api provided');
    const { remoteGetFilesInfo } = useRemoteIpfsClient.getState();
    const { getFile } = ipfsGalactFetchClient.getState();
    const files = await remoteGetFilesInfo();
    files.forEach(async (file) => {
      await getFile(file.cid);
    });

    set({ status: 'idle' });
  },

  uploadFile: async (file: File, fileProps: FileProps, alias?: string) => {
    set({ status: 'loading' });
    const { api } = useRemoteIpfsClient.getState();
    if (!api) throw new Error('no api provided');
    const { remoteUploadFile } = useRemoteIpfsClient.getState();

    set({ status: 'idle' });
    return await remoteUploadFile(file, fileProps, alias);
  },
}));
