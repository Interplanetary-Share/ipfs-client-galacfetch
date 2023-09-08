import axios from 'axios';
import { io } from 'socket.io-client';
import { create } from 'zustand';
import { ipfsGalactFetchClient, queryParams } from './ipfsGalactFetchClient';
import {
  fileApi,
  fileUpload,
  getAllFiles,
  getExtraPropsFiles,
  restoreIntegrity,
  serverCheck,
  serverGetHost,
} from './types/api';
import { useLocalIpfsStore } from './useLocalIpfsStore';
import { blobBufferToFile, fileToBlobUrl, isFilePreloaded } from './utils/file';

interface IDownloadChunk {
  status: string;
  chunk: any;
  progress: number;
  sizeSent: number;
  cid: string;
  name: string;
  type: string;
  size: number;
}

type serverItem = {
  host: string;
  ws: any;
};

export interface UrlFileList {
  url: string;
  cid: string;
}

export type remoteFileInfoResponse = {
  cid: string;
  name: string;
  description: string;
  type: string;
  size: number;
  token: string;
  serverAlias: string;
  isPublic: boolean;
  updatedAt: string;
  createdAt: string;
  __v: number;
  _id: string;
};

export type FileProps = {
  name: string;
  description: string;
  isPublic: boolean;
  extraProperties?: Object;
};

export type FilePropsEdit = {
  name?: string;
  description?: string;
  isPublic?: boolean;
  extraProperties?: Object;
};

type Store = {
  servers: serverItem[];
  init: (api: string) => Promise<void>;
  addNewBlobUrl: (urlFile: UrlFileList) => void;
  api: string | null;
  remoteCheckIntegrityFile: (cid: string) => Promise<Boolean>;
  remoteGetFileInfo: (cid: string) => Promise<remoteFileInfoResponse>;
  remoteGetFilesInfo: (
    isPublic: boolean,
    queryParams?: queryParams
  ) => Promise<remoteFileInfoResponse[]>;
  remoteGetFile: (cid: string) => Promise<void>;
  remoteUploadFile: (file: File, fileProps: FileProps) => Promise<void>;
  remoteRestoreIntegrityFile: (blob: Blob, cid: string) => Promise<void>;
  remotegetFileExtraProps: (cid: string) => Promise<any>; //TODO add response promises
  remoteUpdateFile: (cid: string, fileprops: FilePropsEdit) => Promise<any>;
};

export const useRemoteIpfsClient = create<Store>(
  (set): Store => ({
    servers: [],
    api: null,
    init: async (api) => {
      const { addNewBlobUrl } = useRemoteIpfsClient.getState();
      const { localAddFile } = useLocalIpfsStore.getState();

      const getServers = await axios
        .get(serverGetHost, {
          headers: {
            authorization: `Bearer ${api}`,
          },
        })
        .then(async (res) => {
          return res.data;
        })
        .catch((err) => {
          throw new Error(err);
        });

      // TODO: test with user without servers, should return empty array
      if (!getServers) throw new Error('no servers found');

      const serversList = [] as serverItem[];

      getServers.forEach((server: string) => {
        const socket = io(server, {
          auth: {
            token: api,
          },
        });

        // TODO: check if WS connect on new user, new file, etc.
        // TODO: make a function to check if WS is connected
        // TODO: make a function to connect WS
        // TODO: make a function to add new server to list

        serversList.push({
          host: server,
          ws: socket,
        });

        const blobList = {} as any;
        socket.on(
          'download/socket',
          ({
            status,
            chunk,
            progress,
            sizeSent,
            cid,
            size,
            type,
          }: IDownloadChunk) => {
            if (status === 'start') {
              blobList[cid] = [];
            }
            if (status === 'downloading') {
              const blob = new Blob([chunk]);
              blobList[cid].push(blob);

              if (progress && sizeSent && size) {
                // TODO: send this  progress somehow...
                console.log(
                  `fastlog => progress:`,
                  progress,
                  '%' + ' ' + 'sizeSent: ',
                  sizeSent,
                  'size: ',
                  size
                );
              }
            }
            if (status === 'end') {
              const temporalBlobFile = type
                ? new Blob(blobList[cid], { type: type })
                : new Blob(blobList[cid]);

              const url = fileToBlobUrl(temporalBlobFile);
              addNewBlobUrl({ url: url, cid: cid });
              localAddFile(temporalBlobFile, cid);
              blobList[cid] = [];
            }
          }
        );
      });

      set({ servers: serversList });
      set({ api });
    },

    addNewBlobUrl: (blobToAdd: UrlFileList) => {
      const { urlFileList } = ipfsGalactFetchClient.getState();
      if (!isFilePreloaded(urlFileList, blobToAdd.cid)) {
        ipfsGalactFetchClient.setState({
          urlFileList: [...urlFileList, blobToAdd],
        });
      }
    },
    remoteCheckIntegrityFile: async (cid: string) => {
      const { api, remoteGetFileInfo } = useRemoteIpfsClient.getState();
      if (!api) throw new Error('no api provided');

      const fileInfo = await remoteGetFileInfo(cid);

      const checkIntegrityFile = (await axios
        .get(serverCheck + '/' + fileInfo.serverAlias + '/' + cid, {
          headers: {
            authorization: `Bearer ${api}`,
          },
        })
        .then((res) => {
          return res.data;
        })) as boolean;

      return checkIntegrityFile;
    },

    remoteGetFileInfo: async (cid: string) => {
      const { api } = useRemoteIpfsClient.getState();
      if (!api) throw new Error('no api provided');

      const fileInfo = await axios
        .get(fileApi + '/' + cid, {
          headers: {
            authorization: `Bearer ${api}`,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(`fastlog => err:`, err);
        });
      return fileInfo as remoteFileInfoResponse;
    },
    remoteGetFilesInfo: async (isPublic = false, queryParams?: queryParams) => {
      const { api } = useRemoteIpfsClient.getState();
      if (!api) throw new Error('no api provided');

      const allFilesInfo = await axios
        .get(getAllFiles, {
          headers: {
            authorization: `Bearer ${api}`,
          },
          params: {
            ...queryParams,
            isPublic,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(`fastlog => err:`, err);
        });
      return allFilesInfo as remoteFileInfoResponse[];
    },
    remoteGetFile: async (cid: string) => {
      const { api, servers } = useRemoteIpfsClient.getState();
      if (!api) throw new Error('no api provided');

      servers.forEach((server) => {
        server.ws.emit('download/socket', { cid: cid });
      });
    },

    remoteUploadFile: async (file: File, fileProps) => {
      const { api } = useRemoteIpfsClient.getState();
      const { localAddFile } = useLocalIpfsStore.getState();

      if (!api) throw new Error('no api provided');

      const { name, description, extraProperties, isPublic } = fileProps;

      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer]);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('extraProperties', JSON.stringify(extraProperties));

      const response = await axios
        .post(fileUpload, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${api}`,
          },
          params: {
            isPublic: isPublic,
          },
        })
        .then((res) => {
          const {
            meta: { cid },
          } = res.data;
          localAddFile(blob, cid);
          return res.data;
        })
        .catch((err) => {
          console.error(err);
        });

      return response;
    },
    remoteRestoreIntegrityFile: async (blob: Blob, cid: string) => {
      const { api, remoteGetFileInfo } = useRemoteIpfsClient.getState();
      const { localAddFile } = useLocalIpfsStore.getState();
      if (!api) throw new Error('no api provided');

      const infoFile = await remoteGetFileInfo(cid);
      const { serverAlias } = infoFile;

      const file = blobBufferToFile(blob, cid);
      await localAddFile(blob, cid);
      const formData = new FormData();
      formData.append('file', file);

      return await axios
        .post(restoreIntegrity + '/' + serverAlias.trim(), formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${api}`,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(`fastlog => err:`, err);
        });
    },
    remotegetFileExtraProps: async (cid: string) => {
      const { api } = useRemoteIpfsClient.getState();
      if (!api) throw new Error('no api provided');

      const extraProps = await axios
        .get(getExtraPropsFiles + '/' + cid, {
          headers: {
            authorization: `Bearer ${api}`,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(`fastlog => err:`, err);
        });

      return extraProps;
    },
    remoteUpdateFile: async (cid: string, fileProps: FilePropsEdit) => {
      const { api } = useRemoteIpfsClient.getState();
      if (!api) throw new Error('no api provided');

      const response = await axios
        .put(fileApi + '/' + cid, fileProps, {
          headers: {
            authorization: `Bearer ${api}`,
          },
        })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log(`fastlog => err:`, err);
        });

      return response;
    },
  })
);
