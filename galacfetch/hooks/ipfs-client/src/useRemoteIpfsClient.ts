import { ObjectStoresEnum, indexDbStore } from '@intershare/hooks.indexdb'
import axios from 'axios'
import { io } from 'socket.io-client'
import { create } from 'zustand'
import {
  fileApi,
  fileUpload,
  getAllFiles,
  getExtraPropsFiles,
  serverCheck,
  serverGetHost,
} from './types/api'
import {
  IDownloadChunkInfo,
  IPaginationAndSortingParams,
  IRemoteFileInfo,
  TErrorStatus,
  TFileCreationProps,
  TFileEditProps,
  TServerItem,
} from './types/file'
import { wrapperProtect } from './utils/api'
// TODO: update fileToBlobUrl, reassembleBlob and useLocalIpfsStore from local-ipfs-file-manager library
import {
  fileToBlobUrl,
  localIpfsFileManager,
  reassembleBlob,
} from '../../local-ipfs-file-manager'

type Store = {
  status: undefined | 'idle' | 'loading' | TErrorStatus
  servers: TServerItem[]
  init: (api: string) => Promise<void>
  // addNewBlobUrl: (urlFile: IFileUrlInfo) => void // MOVED TO LOCALIPFSSTORE
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

  remotegetFileExtraProps: (cid: string) => Promise<any> // TODO add response promises
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
        const { socket, peerConnection, dataChannel } = await connectToSocket(
          server,
          api
        )
        serversList.push({
          host: server,
          ws: socket,
          peerCon: peerConnection,
          dataChan: dataChannel,
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
      const { uploadBlobAndCreateUrl, getLocalFileUrl, addNewBlobUrl } =
        localIpfsFileManager.getState()
      const { getData } = indexDbStore.getState()

      return new Promise((resolve) => {
        const socket = io(url, {
          auth: {
            token: api,
          },
        })

        // Inicializar WebRTC
        const peerConnection = new RTCPeerConnection()
        const dataChannel = peerConnection.createDataChannel('fileTransfer')

        peerConnection.createOffer().then((offer) => {
          peerConnection.setLocalDescription(offer)
          socket.emit('offer', offer)
        })

        // Manejar ICE Candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', event.candidate)
          }
        }

        // Escuchar candidatos ICE desde el servidor
        socket.on('ice-candidate', (iceCandidate) => {
          const candidate = new RTCIceCandidate(iceCandidate)
          peerConnection.addIceCandidate(candidate)
        })

        // Escuchar ofertas SDP desde el servidor
        socket.on('offer', async (offer, senderSocketId) => {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          )
          const answer = await peerConnection.createAnswer()
          await peerConnection.setLocalDescription(answer)
          socket.emit('answer', answer, senderSocketId)
        })

        // Escuchar respuestas SDP desde el servidor
        socket.on('answer', (answer) => {
          const remoteAnswer = new RTCSessionDescription(answer)
          peerConnection.setRemoteDescription(remoteAnswer)
        })

        socket.on('connect', () => {
          resolve({
            socket,
            peerConnection,
            dataChannel,
          })
        })

        const bufferList = {} as any

        // Responder si tiene el archivo o no en caso de que alguien conectado se lo pregunte.
        dataChannel.onmessage = async (event) => {
          const message = JSON.parse(event.data)

          if (message.type === 'checkFile') {
            const isFile = await getLocalFileUrl(message.cid)
            if (!isFile) {
              dataChannel.send(
                JSON.stringify({
                  type: 'fileStatus',
                  hasFile: false,
                  cid: message.cid,
                })
              )
            }
          }

          if (message.type === 'fileStatus' && !message.hasFile) {
            const isFile = await getLocalFileUrl(message.cid)
            if (isFile) {
              // alguien esta pidiendo el archivo. enviarlo. si lo tengo en  local.

              const fileData = await getData(
                message.cid,
                ObjectStoresEnum.files
              )
              if (!fileData) return undefined

              const buffers = fileData.buffers as ArrayBuffer[]

              buffers.forEach((buffer, idx) => {
                if (idx === 0)
                  dataChannel.send(
                    JSON.stringify({
                      type: 'sendChunk',
                      chunk: buffer,
                      cid: message.cid,
                      status: 1,
                      dataType: fileData.type,
                    })
                  )

                if (idx === buffers.length - 1)
                  dataChannel.send(
                    JSON.stringify({
                      type: 'sendChunk',
                      chunk: buffer,
                      cid: message.cid,
                      status: 3,
                      dataType: fileData.type,
                    })
                  )

                if (idx !== 0 && idx !== buffers.length - 1)
                  dataChannel.send(
                    JSON.stringify({
                      type: 'sendChunk',
                      chunk: buffer,
                      cid: message.cid,
                      status: 2,
                      dataType: fileData.type,
                    })
                  )
              })
            }
          }

          if (message.type === 'sendChunk') {
            // alguien ha enviado el archivo. recibirlo. si no lo tengo en local.
            const isFile = await getLocalFileUrl(message.cid)
            if (!isFile) {
              if (message.status === 1) {
                bufferList[message.cid] = []
                bufferList[message.cid].push(message.chunk)
              }
              if (message.status === 2) {
                bufferList[message.cid].push(message.chunk)
              }
              if (message.status === 3) {
                bufferList[message.cid].push(message.chunk)

                const blob = reassembleBlob(
                  bufferList[message.cid],
                  message.dataType
                )
                const url = fileToBlobUrl(blob)
                addNewBlobUrl({
                  cid: message.cid,
                  url,
                })
                uploadBlobAndCreateUrl(message.cid, blob)

                bufferList[message.cid] = []
              }
            }
          }
        }

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
              const temporalBlobFile = new Blob(blobList[cid], { type })
              const url = fileToBlobUrl(temporalBlobFile)
              addNewBlobUrl({ url, cid })
              uploadBlobAndCreateUrl(cid, temporalBlobFile)
              blobList[cid] = []
            }
          }
        )
      })
    },

    remoteCheckIntegrityFile: async (cid: string) => {
      return await wrapperProtect(set, async () => {
        const { api, remoteGetFileInfo } = useRemoteIpfsClient.getState()
        const fileInfo = await remoteGetFileInfo(cid)

        const checkIntegrityFile = (await axios
          .get(`${serverCheck}/${fileInfo.serverAlias}/${cid}`, {
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
          .get(`${fileApi}/${cid}`, {
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
          const { ws } = server
          ws.emit('download', cid)
        })
      }),

    remoteUploadFile: async (file: File, fileProps) =>
      await wrapperProtect(set, async () => {
        const { api } = useRemoteIpfsClient.getState()
        const { uploadBlobAndCreateUrl } = localIpfsFileManager.getState()

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
              isPublic,
            },
          })
          .then((res) => {
            const {
              meta: { cid },
            } = res.data
            uploadBlobAndCreateUrl(cid, blob)
            return res.data
          })
          .catch((err) => {
            console.error(err)
          })

        return response
      }),

    remotegetFileExtraProps: async (cid: string) =>
      await wrapperProtect(set, async () => {
        const { api } = useRemoteIpfsClient.getState()
        const extraProps = await axios
          .get(`${getExtraPropsFiles}/${cid}`, {
            headers: {
              authorization: `Bearer ${api}`,
            },
          })
          .then((res) => {
            return res.data
          })
          .catch((err) => {
            console.error(err)
          })

        return extraProps
      }),

    remoteUpdateFile: async (cid: string, fileProps: TFileEditProps) =>
      await wrapperProtect(set, async () => {
        const { api } = useRemoteIpfsClient.getState()
        const response = await axios
          .put(`${fileApi}/${cid}`, fileProps, {
            headers: {
              authorization: `Bearer ${api}`,
            },
          })
          .then((res) => {
            return res.data
          })
          .catch((err) => {
            console.error(err)
          })

        return response
      }),
  })
)
