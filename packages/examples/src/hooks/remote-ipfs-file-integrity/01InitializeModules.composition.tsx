import React, { useEffect, useState } from 'react'
import { indexDbStore } from '@galacfetch/indexdb'
import { secureConnectManager } from '@galacfetch/secure-connect-manager'
import { remoteIpfsFileIntegrity } from '@galacfetch/remote-ipfs-file-integrity'

export const InitializeModules: React.FC = () => {
  const { initIndexedDb } = indexDbStore()
  const { init: initConnectManager, intervalId } = secureConnectManager()
  const { init: initFileIntegrity } = remoteIpfsFileIntegrity()

  const [status, setStatus] = useState({
    indexDb: 'Not initialized',
    secureConnect: 'Not initialized',
    remoteIpfsFileIntegrity: 'Not initialized',
  })

  const [apiKey, setApiKey] = useState('')

  const initializeAllModules = () => {
    // Initialize indexDbStore
    initIndexedDb('myDatabase')
      .then(() => setStatus((prev) => ({ ...prev, indexDb: 'Initialized' })))
      .catch((error) => console.error('Error initializing IndexedDB', error))

    // Initialize secureConnectManager
    if (!intervalId) {
      initConnectManager({
        api: apiKey,
        discoveryInterval: 100000000, // High interval for manual sync
      })
      // setStatus((prev) => ({ ...prev, secureConnect: 'Initialized' }))
    }

    // Initialize remoteIpfsFileIntegrity with high interval
    initFileIntegrity()
    setStatus((prev) => ({ ...prev, remoteIpfsFileIntegrity: 'Initialized' }))
  }

  useEffect(() => {
    if (intervalId) {
      setStatus((prev) => ({ ...prev, secureConnect: 'Initialized' }))
    } else {
      setStatus((prev) => ({ ...prev, secureConnect: 'Not initialized' }))
    }
  }, [intervalId])

  return (
    <div>
      <h3>Initialize Modules</h3>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter API Key for SecureConnectManager"
      />
      <button onClick={initializeAllModules}>Connect</button>
      <div>
        <p>IndexDB Status: {status.indexDb}</p>
        <p>SecureConnectManager Status: {status.secureConnect}</p>
        <p>RemoteIpfsFileIntegrity Status: {status.remoteIpfsFileIntegrity}</p>
      </div>
    </div>
  )
}
