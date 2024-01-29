import { ExtendedSocket } from '@intershare/hooks.secure-connect-manager'
import { Socket } from 'socket.io-client'

type Tconfig = {
  discoveryInterval: number
}

// Tipos actualizados

type WebRTCConnectionInfo = {
  localPeerId: string // ID del WebSocket  local asociado
  remotePeerId: string // ID del WebSocket remoto asociado
  connection: RTCPeerConnection // La conexión WebRTC
  isEstablishing: boolean // Indica si la conexión está en proceso de establecimiento
  dataChannel: RTCDataChannel | null // DataChannel asociado
  filesShared: string[] // IDs de archivos compartidos
  filesReceived: string[] // IDs de archivos recibidos
}

export type TClientsMap = {
  newClientId: string
  clientId: string
  channelId: number
}

export type TWebRTCLocalShare = {
  config: Tconfig
  init: (config: Tconfig) => void
  // Here we save the clientUpdates
  setupDiscoverClients: (ws: ExtendedSocket) => void // TODO: check circular dependency

  webRTCConnections: WebRTCConnectionInfo[]

  createNewRTCPeerConnection: (ws: Socket, client: TClientsMap) => void

  setupDataChannel: (
    peerConnection: RTCPeerConnection,
    dataChannelId: number,
    client: TClientsMap
  ) => RTCDataChannel
  setupICEEvents: (
    peerConnection: RTCPeerConnection,
    ws: Socket,
    client: TClientsMap
  ) => void
  setupDataChannelEvents: (
    dataChannel: RTCDataChannel,
    client: TClientsMap
  ) => void
}
