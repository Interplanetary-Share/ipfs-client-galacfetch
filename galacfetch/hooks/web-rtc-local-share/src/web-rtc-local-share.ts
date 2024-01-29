import indexDbStore, { ObjectStoresEnum } from '@intershare/hooks.indexdb'
import localIpfsFileManager from '@intershare/hooks.local-ipfs-file-manager'
import { secureConnectManager } from '@intershare/hooks.secure-connect-manager'
import {
  blobToArrayBuffer,
  chunkArrayBuffer,
  reassembleArrayBuffer,
  reassembleBlob,
} from '@intershare/utils.general'
import { create } from 'zustand'
import { TClientsMap, TWebRTCLocalShare } from './common'

export const webRTCLocalShare = create<TWebRTCLocalShare>(
  (set, get): TWebRTCLocalShare => ({
    config: {
      discoveryInterval: 60000,
    },
    setupDiscoverClients: (ws) => {
      const { createNewRTCPeerConnection } = webRTCLocalShare.getState()

      ws.emit('client-maps-init')

      ws.on('client-maps-new', (clientMap: TClientsMap) => {
        console.log('Received new client map', clientMap)
        createNewRTCPeerConnection(ws, clientMap)
      })

      ws.webRTCListening = true
    },
    webRTCConnections: [],
    init: (config) => {
      const initSetup = () => {
        const { wsConnected } = secureConnectManager.getState()
        const { setupDiscoverClients } = webRTCLocalShare.getState()
        wsConnected.forEach((ws) => {
          if (!ws.webRTCListening) {
            console.log('Setting up discover clients for', ws.id)
            setupDiscoverClients(ws)
          }
        })
      }

      setInterval(async () => {
        initSetup()
        console.log('Checking for new ws connections')
      }, config.discoveryInterval)

      initSetup()

      set((prevState) => ({
        config: { ...prevState.config, ...config },
      }))
    },

    createNewRTCPeerConnection: (ws, client) => {
      const { setupICEEvents } = get()
      const peerConnection = new RTCPeerConnection()

      console.log('Creating new RTCPeerConnection', client, ws.id)

      set((state) => ({
        webRTCConnections: [
          ...state.webRTCConnections,
          {
            localPeerId: ws.id,
            remotePeerId: client.newClientId,
            connection: peerConnection,
            isEstablishing: true,
            filesShared: [],
            filesReceived: [],
            dataChannel: null,
          },
        ],
      }))

      setupICEEvents(peerConnection, ws, client)
    },

    setupDataChannel: (peerConnection, dataChannelId, client) => {
      const { setupDataChannelEvents } = webRTCLocalShare.getState()
      const dataChannel = peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
        negotiated: true,
        id: dataChannelId,
      })
      setupDataChannelEvents(dataChannel, client)
      return dataChannel
    },

    setupICEEvents: (peerConnection, ws, client) => {
      let isNegotiating = false
      const { setupDataChannel } = webRTCLocalShare.getState()

      const dataChannel = setupDataChannel(
        peerConnection,
        client.channelId,
        client
      )
      console.log('Setting up ICE events', dataChannel)

      set((state) => ({
        webRTCConnections: state.webRTCConnections.map((conn) => {
          if (
            conn.localPeerId === ws.id &&
            conn.remotePeerId === client.newClientId
          ) {
            return { ...conn, dataChannel, isEstablishing: false }
          }
          return conn
        }),
      }))

      // Cuando se genera un nuevo candidato ICE local
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Local ICE candidate: ${event.candidate.candidate}`)
          ws.emit('ice-candidate', event.candidate)
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

      peerConnection.onnegotiationneeded = async () => {
        try {
          if (isNegotiating) {
            console.log('Skipping unnecessary negotiation')
            return
          }
          isNegotiating = true

          console.log(
            'Negotiation needed - localDescription:',
            peerConnection.localDescription
          )

          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)

          ws.emit('offer', offer, client.newClientId) // Send offer to remote peer
        } catch (error) {
          console.error('Error during negotiation:', error)
        } finally {
          isNegotiating = false
        }
      }

      peerConnection.onsignalingstatechange = (event) => {
        // Previene que se negocie múltiples veces
        isNegotiating = peerConnection.signalingState !== 'stable'
      }

      ws.on('offer', async (offer, senderSocketId) => {
        try {
          console.log('Received offer', offer)

          // Comprueba si la conexión puede aceptar una oferta
          if (peerConnection.signalingState === 'have-local-offer') {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(offer)
            )
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)

            ws.emit('answer', answer, senderSocketId)
          } else {
            console.log(
              'Not ready to accept offer. Current state:',
              peerConnection.signalingState
            )
          }
        } catch (error) {
          console.error('Error handling offer:', error)
        }
      })

      ws.on('answer', async (answer) => {
        try {
          console.log('Received answer', answer)
          const remoteAnswer = new RTCSessionDescription(answer)
          if (peerConnection.signalingState !== 'stable') {
            await peerConnection.setRemoteDescription(remoteAnswer)
            console.log('Remote description set successfully')
          } else {
            console.log(
              'Connection is already in stable state. Ignoring answer.'
            )
          }
        } catch (error) {
          console.error('Error setting remote description:', error)
        }
      })
    },

    setupDataChannelEvents: (dataChannel, client) => {
      const { getLocalFileUrl, uploadBlobAndCreateUrl, preloadAllLocalFiles } =
        localIpfsFileManager.getState()
      const { getData } = indexDbStore.getState()
      let ackHandlers = {}
      const waitForAck = (cid: string) => {
        return new Promise<void>((resolve) => {
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
            set((state) => ({
              webRTCConnections: state.webRTCConnections.map((conn) => {
                if (
                  conn.remotePeerId === client.newClientId &&
                  !conn.filesShared.includes(message.cid)
                ) {
                  return {
                    ...conn,
                    filesShared: [...conn.filesShared, message.cid],
                  }
                }
                return conn
              }),
            }))
            break
          case 'finish':
            await handleFinishMessage(message)

            set((state) => ({
              webRTCConnections: state.webRTCConnections.map((conn) => {
                if (
                  conn.remotePeerId === client.newClientId &&
                  !conn.filesReceived.includes(message.cid)
                ) {
                  return {
                    ...conn,
                    filesReceived: [...conn.filesReceived, message.cid],
                  }
                }
                return conn
              }),
            }))

            break
          case 'notifyOriginCompleted':
            ackHandlers[message.cid]()

            break
          default:
            console.log('Unhandled message type:', message.type)
        }
      }

      const handleCheckFileMessage = async (message) => {
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
