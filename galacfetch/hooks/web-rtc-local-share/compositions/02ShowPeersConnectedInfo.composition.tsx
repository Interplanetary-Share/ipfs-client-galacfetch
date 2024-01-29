import React from 'react'
import { webRTCLocalShare } from '../src/web-rtc-local-share'

export const ShowPeerConnectedInfo: React.FC = () => {
  const { webRTCConnections } = webRTCLocalShare()

  return (
    <>
      <h1>Connected Peers</h1>
      {webRTCConnections.map((connection, i) => (
        <div key={i}>
          <div>Local Peer ID: {connection.localPeerId}</div>
          <div>Remote Peer ID: {connection.remotePeerId}</div>
          <div>dataChannelID: {connection.dataChannel?.id}</div>
          <div>Establishing: {connection.isEstablishing ? 'Yes' : 'No'}</div>
          <div>
            Files Shared CID:
            <ul>
              {connection.filesShared.map((cid) => (
                <li>{cid}</li>
              ))}
            </ul>
          </div>
          <div>
            Files Received CID:
            <ul>
              {connection.filesReceived.map((cid) => (
                <li>{cid}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </>
  )
}
