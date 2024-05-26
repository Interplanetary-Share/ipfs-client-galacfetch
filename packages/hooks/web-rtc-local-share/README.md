# webRTCLocalShare Component Documentation

The `webRTCLocalShare` component is a robust solution for managing WebRTC connections and file sharing within React applications. It's part of the `@galacfetch/web-rtc-local-share` library and integrates seamlessly with `@galacfetch/secure-connect-manager` and `@galacfetch/indexdb` for comprehensive WebSocket management and local data storage, respectively.

## Key Features

- **Dynamic WebRTC Connection Handling**: Manages multiple WebRTC connections per WebSocket, allowing for scalable peer-to-peer interactions.
- **File Sharing Mechanism**: Coordinates the sharing and receiving of files, handling file data and status updates.
- **Data Channel Configuration**: Sets up and manages data channels for each WebRTC connection, facilitating file transfer operations.
- **Client Discovery and Mapping**: Regularly discovers new clients and maps them for connection establishment.

## Initialization

To initialize `webRTCLocalShare`, first import necessary modules and set up the component. Ensure that dependencies like `@galacfetch/secure-connect-manager` and `@galacfetch/indexdb` are also initialized.

### Initializing `webRTCLocalShare`

```tsx
import React, { useEffect, useState } from 'react'
import { webRTCLocalShare } from '@galacfetch/web-rtc-local-share'
import { secureConnectManager } from '@galacfetch/secure-connect-manager'
import { indexDbStore } from '@galacfetch/indexdb'

export const InitializeWebRTCLocalShare: React.FC = () => {
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState({
    webRTCLocalShare: 'Not initialized',
    secureConnect: 'Not initialized',
    indexDb: 'Not initialized',
  })
  const { init: initSecureConnectManager, intervalId } = secureConnectManager()
  const { init: initWebRTCLocalShare } = webRTCLocalShare()
  const { initIndexedDb } = indexDbStore()

  useEffect(() => {
    if (intervalId) {
      setStatus((prev) => ({ ...prev, secureConnect: 'Initialized' }))
    } else {
      setStatus((prev) => ({ ...prev, secureConnect: 'Not initialized' }))
    }
  }, [intervalId])

  const initializeAllModules = async () => {
    initIndexedDb('myDatabase')
      .then(() => setStatus((prev) => ({ ...prev, indexDb: 'Initialized' })))
      .catch((error) => console.error('Error initializing IndexedDB', error))

    // Inicialización de secureConnectManager con la API key
    initSecureConnectManager({
      api: apiKey,
      discoveryInterval: 60000, // Intervalo de descubrimiento en milisegundos
    })

    // Inicialización de webRTCLocalShare
    initWebRTCLocalShare({
      discoveryInterval: 1000, // Intervalo de descubrimiento para WebRTC
    })
    setStatus((prev) => ({ ...prev, webRTCLocalShare: 'Initialized' }))
  }
  return (
    <div>
      <h3>Initialize WebRTC Local Share</h3>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter API Key for SecureConnectManager"
      />
      <button onClick={initializeAllModules}>Initialize</button>
      <div>
        <p>IndexDB Status: {status.indexDb}</p>
        <p>SecureConnectManager Status: {status.secureConnect}</p>
        <p>WebRTCLocalShare Status: {status.webRTCLocalShare}</p>
      </div>
    </div>
  )
}
```

### Notes

- The `init` function of `webRTCLocalShare` configures the discovery interval for WebRTC connections.
- `secureConnectManager` and `indexDbStore` are used for managing WebSocket connections and local data storage, respectively.

## Usage

### Show Peer Connection Information

The following example demonstrates how to display information about connected peers:

```tsx
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
```

### Notes

- `webRTCConnections` provides details about each connected peer, including IDs, data channel status, and file sharing information.

## Types

- `Tconfig`: Configuration type for setting up the discovery interval.
- `WebRTCConnectionInfo`: Contains detailed information about each WebRTC connection, including peer IDs, connection status, and associated data channels.
- `TClientsMap`: Maps new clients for connection establishment.
- `TWebRTCLocalShare`: Main type of the `webRTCLocalShare` component, encapsulating all functionalities and configurations.

## Contributing

Contributions to enhance `webRTCLocalShare` are welcome. If you have ideas for improvements, bug fixes, or additional features, please submit a pull request or open an issue on the GitHub repository. Your contributions help in making `webRTCLocalShare` more efficient and versatile for React-based applications.
