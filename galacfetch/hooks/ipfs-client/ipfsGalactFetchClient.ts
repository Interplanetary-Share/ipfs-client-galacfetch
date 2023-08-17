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

export interface queryParams {
  page?: number;
  size?: number;
  filter?: object | undefined;
  sort?: object | undefined;
}

type Store = {
  status: undefined | 'idle' | 'loading';
  init: (api: string, repoName: string) => Promise<void>;
  getFile: (cid: string, config?: getFileConfig) => Promise<any>; //TODO add response promises
  getFiles: (
    isPublic?: boolean,
    config?: getFileConfig,
    queryParams?: queryParams
  ) => Promise<any>;
  uploadFile: (
    file: File,
    fileProps: FileProps,
    alias?: string
  ) => Promise<void>;
  urlFileList: UrlFileList[];
  findPreloadFile: (cid: string) => UrlFileList | undefined;
};

export const ipfsGalactFetchClient = create<Store>()(
  (set): Store => ({
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
        // TODO add isPublic Scope
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
      const info = config.showInfoFile
        ? await remoteGetFileInfo(cid)
        : undefined;
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

    getFiles: async (
      isPublic = false,
      config?: getFileConfig,
      queryParams?: queryParams
    ) => {
      set({ status: 'loading' });
      const { api } = useRemoteIpfsClient.getState();
      if (!api) throw new Error('no api provided');

      const { remoteGetFilesInfo } = useRemoteIpfsClient.getState();
      const { getFile } = ipfsGalactFetchClient.getState();

      const files = await remoteGetFilesInfo(isPublic, queryParams);
      if (!files) {
        set({ status: 'idle' });
        console.warn('no files found');
        return [];
      }

      const response = await Promise.all(
        files.map(async (file) => {
          const { url, info, extraProps } = await getFile(file.cid, config);
          return {
            url,
            info,
            extraProps,
          };
        })
      );

      set({ status: 'idle' });
      return response;
    },

    findPreloadFile: (cid: string) => {
      set({ status: 'loading' });
      const { urlFileList } = ipfsGalactFetchClient.getState();
      set({ status: 'idle' });
      return urlFileList.find((file) => file.cid === cid);
    },

    uploadFile: async (file: File, fileProps: FileProps, alias?: string) => {
      set({ status: 'loading' });
      const { api } = useRemoteIpfsClient.getState();
      if (!api) throw new Error('no api provided');
      const { remoteUploadFile } = useRemoteIpfsClient.getState();

      set({ status: 'idle' });
      return await remoteUploadFile(file, fileProps, alias);
    },
  })
);
