import {
  IDownloadChunkInfo,
  IFileUrlInfo,
  IPaginationAndSortingParams,
  IRemoteFileInfo,
  TErrorStatus,
  TFileCreationProps,
  TFileEditProps,
  TServerItem,
} from './types/file'
import { blobBufferToFile, fileToBlobUrl, isFilePreloaded } from './utils/file'
import {
  fileApi,
  fileUpload,
  getAllFiles,
  getExtraPropsFiles,
  restoreIntegrity,
  serverCheck,
  serverGetHost,
} from './types/api'

import axios from 'axios'
import { create } from 'zustand'
import { io } from 'socket.io-client'
import { ipfsGalactFetchClient } from './ipfsGalactFetchClient'
import { useLocalIpfsStore } from './useLocalIpfsStore'
import { wrapperProtect } from './utils/api'

type Store = {
  status: undefined | 'idle' | 'loading' | TErrorStatus
  servers: TServerItem[]
  init: (api: string) => Promise<void>
  addNewBlobUrl: (urlFile: IFileUrlInfo) => void
  api: string | null
  remoteCheckIntegrityFile: (cid: string) => Promise<Boolean>
  remoteGetFileInfo: (cid: string) => Promise<IRemoteFileInfo>
  remoteGetFilesInfo: (
    isPublic: boolean,
    queryParams?: IPaginationAndSortingParams
  ) => Promise<IRemoteFileInfo[]>
  remoteGetFile: (cid: string) => Promise<void>
  remoteUploadFile: (
    file: File,
    fileProps: TFileCreationProps
  ) => Promise<IRemoteFileInfo>
  remoteRestoreIntegrityFile: (blob: Blob, cid: string) => Promise<void>
  remotegetFileExtraProps: (cid: string) => Promise<any> //TODO add response promises
  remoteUpdateFile: (
    cid: string,
    fileprops: TFileEditProps
  ) => Promise<IRemoteFileInfo>
  connectToSocket: (url: string, api: string) => Promise<any>
}

export const useRemoteIpfsClient = create<Store>(
  (set): Store => ({
    status: undefined,
    servers: [],
    api: null,

    init: async (api) => {
      const { connectToSocket } = useRemoteIpfsClient.getState()

      const getServers = await axios
        .get(serverGetHost, {
          headers: {
            authorization: `Bearer ${api}`,
          },
        })
        .then(async (res) => {
          return res.data
        })
        .catch((err) => {
          throw new Error(err)
        })
      // TODO: test with user without servers, should return empty array
      if (!getServers) throw new Error('no servers found')
      const serversList = [] as TServerItem[]
      const socketPromises = getServers.map(async (server: string) => {
        const socket = await connectToSocket(server, api)
        serversList.push({
          host: server,
          ws: socket,
        })
        return socket
      })
      await Promise.all(socketPromises)
      // TODO: check if WS connect on new user, new file, etc.
      // TODO: make a function to check if WS is connected
      set({ servers: serversList })
      set({ api })
    },
    connectToSocket: (url, api) => {
      const { addNewBlobUrl } = useRemoteIpfsClient.getState()
      const { localAddFile } = useLocalIpfsStore.getState()

      return new Promise((resolve) => {
        const socket = io(url, {
          auth: {
            token: api,
          },
        })

        socket.on('connect', () => {
          resolve(socket)
        })

        const blobList = {} as any

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
          }: IDownloadChunkInfo) => {
            if (status === 1) {
              blobList[cid] = []
            }
            if (status === 2) {
              const blob = new Blob([chunk])
              blobList[cid].push(blob)

              if (progress && sizeSent && size) {
                // TODO: send this  progress somehow...
                console.log(
                  `Downloading => progress:`,
                  progress,
                  '%' + ' ' + 'send: ',
                  sizeSent,
                  'size: ',
                  size
                )
              }
            }
            if (status === 3) {
              console.log('fastlog => end')
              const temporalBlobFile = new Blob(blobList[cid], { type: type })
              const url = fileToBlobUrl(temporalBlobFile)
              addNewBlobUrl({ url: url, cid: cid })
              localAddFile(temporalBlobFile, cid)
              blobList[cid] = []
            }
          }
        )
      })
    },
    // TODO: move this to ipfslocal or galactfetchClient
    addNewBlobUrl: (blobToAdd: IFileUrlInfo) => {
      const { urlFileList } = ipfsGalactFetchClient.getState()
      if (!isFilePreloaded(urlFileList, blobToAdd.cid)) {
        ipfsGalactFetchClient.setState({
          urlFileList: [...urlFileList, blobToAdd],
        })
      }
    },
    remoteCheckIntegrityFile: async (cid: string) => {
      return await wrapperProtect(set, async () => {
        const { api, remoteGetFileInfo } = useRemoteIpfsClient.getState()
        const fileInfo = await remoteGetFileInfo(cid)

        const checkIntegrityFile = (await axios
          .get(serverCheck + '/' + fileInfo.serverAlias + '/' + cid, {
            headers: {
              authorization: `Bearer ${api}`,
            },
          })
          .then((res) => {
            return res.data
          })) as boolean

        return checkIntegrityFile
      })
    },

    remoteGetFileInfo: async (cid: string) => {
      return await wrapperProtect(set, async () => {
        const { api } = useRemoteIpfsClient.getState()
        const fileInfo = await axios
          .get(fileApi + '/' + cid, {
            headers: {
              authorization: `Bearer ${api}`,
            },
          })
          .then((res) => {
            return res.data
          })
          .catch((err) => {
            console.log(`fastlog => err:`, err)
          })
        return fileInfo as IRemoteFileInfo
      })
    },
    remoteGetFilesInfo: async (
      isPublic = false,
      queryParams?: IPaginationAndSortingParams
    ) =>
      await wrapperProtect(set, async () => {
        const { api } = useRemoteIpfsClient.getState()
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
            return res.data
          })
          .catch((err) => {
            console.error(err)
          })
        return allFilesInfo as IRemoteFileInfo[]
      }),
    remoteGetFile: async (cid: string) =>
      await wrapperProtect(set, async () => {
        const { servers } = useRemoteIpfsClient.getState()

        servers.forEach((server) => {
          server.ws.emit('download', cid)
        })
      }),

    remoteUploadFile: async (file: File, fileProps) =>
      await wrapperProtect(set, async () => {
        const { api } = useRemoteIpfsClient.getState()
        const { localAddFile } = useLocalIpfsStore.getState()

        const { name, description, extraProperties, isPublic } = fileProps

        const arrayBuffer = await file.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: file.type })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('name', name)
        formData.append('description', description)
        formData.append('extraProperties', JSON.stringify(extraProperties))

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
            } = res.data
            localAddFile(blob, cid)
            return res.data
          })
          .catch((err) => {
            console.error(err)
          })

        return response
      }),

    remoteRestoreIntegrityFile: async (blob: Blob, cid: string) =>
      await wrapperProtect(set, async () => {
        const { api, remoteGetFileInfo } = useRemoteIpfsClient.getState()
        const { localAddFile } = useLocalIpfsStore.getState()

        const infoFile = await remoteGetFileInfo(cid)
        const { serverAlias } = infoFile

        const file = blobBufferToFile(blob, cid)
        await localAddFile(blob, cid)
        const formData = new FormData()
        formData.append('file', file)

        return await axios
          .post(restoreIntegrity + '/' + serverAlias.trim(), formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              authorization: `Bearer ${api}`,
            },
          })
          .then((res) => {
            return res.data
          })
          .catch((err) => {
            console.log(`fastlog => err:`, err)
          })
      }),

    remotegetFileExtraProps: async (cid: string) =>
      await wrapperProtect(set, async () => {
        const { api } = useRemoteIpfsClient.getState()
        const extraProps = await axios
          .get(getExtraPropsFiles + '/' + cid, {
            headers: {
              authorization: `Bearer ${api}`,
            },
          })
          .then((res) => {
            return res.data
          })
          .catch((err) => {
            console.log(`fastlog => err:`, err)
          })

        return extraProps
      }),

    remoteUpdateFile: async (cid: string, fileProps: TFileEditProps) =>
      await wrapperProtect(set, async () => {
        const { api } = useRemoteIpfsClient.getState()
        const response = await axios
          .put(fileApi + '/' + cid, fileProps, {
            headers: {
              authorization: `Bearer ${api}`,
            },
          })
          .then((res) => {
            return res.data
          })
          .catch((err) => {
            console.log(`fastlog => err:`, err)
          })

        return response
      }),
  })
)
