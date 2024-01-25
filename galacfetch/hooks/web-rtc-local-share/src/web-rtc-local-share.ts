import { create } from 'zustand'
import { TWebRTCLocalShare, WebRTCConnectionInfo } from './common'
import secureConnectManager from '@intershare/hooks.secure-connect-manager'
import localIpfsFileManager from '@intershare/hooks.local-ipfs-file-manager'
import indexDbStore, { ObjectStoresEnum } from '@intershare/hooks.indexdb'
import {
  reassembleArrayBuffer,
  reassembleBlob,
} from '@intershare/utils.general'
import { blobToArrayBuffer, chunkArrayBuffer } from '@intershare/utils.general'

export const webRTCLocalShare = create<TWebRTCLocalShare>(
  (set, get): TWebRTCLocalShare => ({
    config: {
      discoveryInterval: 60000,
    },
    webRTCConnections: [],
    init: (config) => {
      const { setupWebRTCConnection } = webRTCLocalShare.getState()
      setInterval(() => {
        console.log('Checking for new connections')
        setupWebRTCConnection()
      }, config.discoveryInterval)

      set((prevState) => ({
        config: {
          ...prevState.config,
          ...config,
        },
      }))
    },
    setupWebRTCConnection: async () => {
      const {
        setupDataChannel,
        setupConnectionEvents,
        setupICEEvents,
        setupSDPEvents,
      } = webRTCLocalShare.getState()
      const { wsConnected } = secureConnectManager.getState()

      // wsConnected.forEach((ws) => {

      // })

      for await (const ws of wsConnected) {
        const { webRTCConnections } = webRTCLocalShare.getState()
        const isAlreadyConnected = webRTCConnections.find(
          (conn) => conn.peerId === ws.id
        )

        if (!isAlreadyConnected) {
          const peerConnection = new RTCPeerConnection()
          const dataChannel = setupDataChannel(peerConnection)
          setupConnectionEvents(peerConnection, ws)
          setupICEEvents(peerConnection, ws)
          setupSDPEvents(peerConnection, ws, dataChannel)

          console.log('New connection established with', ws.id)

          const newConnection: WebRTCConnectionInfo = {
            peerId: ws.id,
            state: peerConnection.connectionState,
            filesShared: [],
          }

          set((state) => ({
            webRTCConnections: [...state.webRTCConnections, newConnection],
          }))
        }
      }
    },
    setupDataChannel: (peerConnection) => {
      const dataChannel = peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
        negotiated: true,
        id: 0,
      })

      // Setup data channel event handlers here
      return dataChannel
    },
    setupConnectionEvents: (peerConnection, ws) => {
      // Setup peer connection event handlers here
    },
    setupICEEvents: (peerConnection, ws) => {
      // Cuando se genera un nuevo candidato ICE local
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Local ICE candidate: ${event.candidate.candidate}`)
          ws.emit('ice-candidate', event.candidate, ws.id)
        }
      }

      // Al recibir un candidato ICE remoto
      ws.on('ice-candidate', async (iceCandidate) => {
        try {
          const candidate = new RTCIceCandidate(iceCandidate)
          console.log(`Remote ICE candidate: ${iceCandidate.candidate}`)
          await peerConnection.addIceCandidate(candidate)
        } catch (error) {
          console.error('Error adding received ICE candidate:', error)
        }
      })
    },

    setupSDPEvents: (peerConnection, ws, dataChannel) => {
      const { getLocalFileUrl, uploadBlobAndCreateUrl, preloadAllLocalFiles } =
        localIpfsFileManager.getState()

      const { getData } = indexDbStore.getState()

      peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer)
        ws.emit('offer', offer)
      })

      ws.on('offer', async (offer, senderSocketId) => {
        console.log('Received offer', offer)
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        )
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        ws.emit('answer', answer, senderSocketId)
      })

      ws.on('answer', (answer) => {
        console.log('Received answer', answer)
        const remoteAnswer = new RTCSessionDescription(answer)
        peerConnection.setRemoteDescription(remoteAnswer)
      })

      let ackHandlers = {}

      const waitForAck = (cid: string) => {
        return new Promise<void>((resolve) => {
          // Aquí guardamos la función 'resolve' en algún lugar accesible
          ackHandlers[cid] = () => {
            return resolve()
          }
        })
      }

      dataChannel.onopen = async () => {
        console.log('DataChannel abierto')
        await preloadAllLocalFiles()
        const { urlFileList } = localIpfsFileManager.getState()

        for (const file of urlFileList) {
          const isFile = await getLocalFileUrl(file.cid)
          if (isFile) {
            console.log('Sending file status check for', file.cid)
            dataChannel.send(
              JSON.stringify({ type: 'checkFile', cid: file.cid })
            )
            await waitForAck(file.cid)
          }
        }
      }

      let arrayBufferStore = [] as ArrayBuffer[]
      dataChannel.onmessage = async (event) => {
        if (event.data instanceof ArrayBuffer) {
          handleArrayBufferMessage(event.data)
        } else if (typeof event.data === 'string') {
          const message = JSON.parse(event.data)
          await handleMessage(message)
        }
      }

      // UTILITIES
      const handleArrayBufferMessage = (arrayBuffer: ArrayBuffer) => {
        arrayBufferStore.push(arrayBuffer)
      }

      const handleMessage = async (message) => {
        switch (message.type) {
          case 'checkFile':
            await handleCheckFileMessage(message)
            break
          case 'getFile':
            await handleGetFileMessage(message)
            break
          case 'finish':
            await handleFinishMessage(message)
            break
          case 'notifyOriginCompleted':
            ackHandlers[message.cid]()
            break
          default:
            console.log('Unhandled message type:', message.type)
        }
      }

      const handleCheckFileMessage = async (message) => {
        // significa que el archivo no está en la base de datos local
        arrayBufferStore = []
        const isFile = await getLocalFileUrl(message.cid)
        if (!isFile) {
          dataChannel.send(
            JSON.stringify({
              type: 'getFile',
              cid: message.cid,
            })
          )
        }
      }

      const handleGetFileMessage = async (message) => {
        arrayBufferStore = []

        const isFile = await getLocalFileUrl(message.cid)
        if (isFile) {
          const fileData = await getData(message.cid, ObjectStoresEnum.files)
          if (!fileData) return

          const buffers = fileData.buffers as Blob[]
          const blob = reassembleBlob(buffers, fileData.type)
          const arrayBuffer = await blobToArrayBuffer(blob)
          const miniChunks = chunkArrayBuffer(arrayBuffer, 15000) // 15KB

          miniChunks.forEach((chunk) => {
            dataChannel.send(chunk)
          })
          dataChannel.send(
            JSON.stringify({
              type: 'finish',
              cid: message.cid,
              dataType: fileData.type,
            })
          )
        }
      }

      const handleFinishMessage = async (message) => {
        const isFile = await getLocalFileUrl(message.cid)
        if (!isFile) {
          const arrayBuffer = reassembleArrayBuffer(arrayBufferStore)
          const blob = reassembleBlob([arrayBuffer], message.dataType)

          await uploadBlobAndCreateUrl(message.cid, blob)
          dataChannel.send(
            JSON.stringify({ type: 'notifyOriginCompleted', cid: message.cid })
          )
        }
      }

      dataChannel.onerror = (error) => {
        console.error('Error:', error)
      }

      dataChannel.onclose = () => {
        console.log('DataChannel cerrado')
      }
    },

    // ... Otros métodos y lógica aquí ...
  })
)
