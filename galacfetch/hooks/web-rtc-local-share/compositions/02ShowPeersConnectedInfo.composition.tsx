import React from 'react'
import { webRTCLocalShare } from '../src/web-rtc-local-share'

export const ShowPeerConnectedInfo: React.FC = () => {
  const { webRTCConnections } = webRTCLocalShare()

  console.log('webRTCConnections', webRTCConnections)

  return webRTCConnections.map((connection) => (
    <div key={connection.peerId}>
      <div>Peer ID: {connection.peerId}</div>
      <div>State: {connection.state}</div>
      <div>Files Shared: {connection.filesShared}</div>
    </div>
  ))
}
