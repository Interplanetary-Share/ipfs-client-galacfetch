import { Socket } from 'socket.io-client'

type Tconfig = {
  discoveryInterval: number
}

export type TWebRTCLocalShare = {
  config: Tconfig
  init: (config: Tconfig) => void
  webRTCConnections: WebRTCConnectionInfo[]
  setupWebRTCConnection: () => void
  setupDataChannel: (peerConnection: RTCPeerConnection) => RTCDataChannel
  setupConnectionEvents: (peerConnection: RTCPeerConnection, ws: Socket) => void
  setupICEEvents: (peerConnection: RTCPeerConnection, ws: Socket) => void
  setupSDPEvents: (
    peerConnection: RTCPeerConnection,
    ws: Socket,
    dataChannel: RTCDataChannel
  ) => void
}

export type WebRTCConnectionInfo = {
  peerId: string
  state: RTCPeerConnectionState
  filesShared: string[]
}
