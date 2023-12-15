import indexDbStore, { ObjectStoresEnum } from '@intershare/hooks.indexdb'
import localIpfsFileManager from '@intershare/hooks.local-ipfs-file-manager'
import secureConnectManager from '@intershare/hooks.secure-connect-manager'
import { reassembleBlob } from '@intershare/utils.general'
import { create } from 'zustand'
import { TWebRTCLocalShare } from './common'

// TODO: add webrtc to share

export const webRTCLocalShare = create<TWebRTCLocalShare>(
  (set): TWebRTCLocalShare => ({
    config: {
      discoveryInterval: 60000,
    },
    init: (config) => {
      setInterval(() => {
        const { wsConnected } = secureConnectManager.getState()
        const { getLocalFileUrl, uploadBlobAndCreateUrl } =
          localIpfsFileManager.getState()
        const { getData } = indexDbStore.getState()
        wsConnected.forEach((ws) => {
          if (!ws.webRTCListening) {
            const peerConnection = new RTCPeerConnection()
            const dataChannel = peerConnection.createDataChannel('fileTransfer')

            // TODO: check this, should we call this in other side? this is called on connect directly.
            peerConnection.createOffer().then((offer) => {
              peerConnection.setLocalDescription(offer)
              ws.emit('offer', offer)
            })

            // START WEBRTC LOGIC
            peerConnection.onicecandidate = (event) => {
              if (event.candidate) {
                ws.emit('ice-candidate', event.candidate)
              }
            }

            ws.on('ice-candidate', (iceCandidate) => {
              const candidate = new RTCIceCandidate(iceCandidate)
              peerConnection.addIceCandidate(candidate)
            })

            ws.on('offer', async (offer, senderSocketId) => {
              await peerConnection.setRemoteDescription(
                new RTCSessionDescription(offer)
              )
              const answer = await peerConnection.createAnswer()
              await peerConnection.setLocalDescription(answer)
              ws.emit('answer', answer, senderSocketId)
            })

            // Escuchar respuestas SDP desde el servidor
            ws.on('answer', (answer) => {
              const remoteAnswer = new RTCSessionDescription(answer)
              peerConnection.setRemoteDescription(remoteAnswer)
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
                    uploadBlobAndCreateUrl(message.cid, blob)
                    bufferList[message.cid] = []
                  }
                }
              }
            }
            ws.webRTCListening = true
          }
        })
      }, config.discoveryInterval)
      set((prevState) => ({
        config: {
          ...prevState.config,
          ...config,
        },
      }))
    },
    // tengo que conectarme a los ws de los servidores remotos.
  })
)
