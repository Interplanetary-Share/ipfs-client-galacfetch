import React, { useEffect, useState } from 'react'
import { indexDbStore } from '@galacfetch/indexdb'
import { secureConnectManager } from '@galacfetch/secure-connect-manager'
import { remoteIpfsFileManager } from '@galacfetch/remote-ipfs-file-manager'

export const InitializeAllModules: React.FC = () => {
  const { initIndexedDb } = indexDbStore()
  const { init: initConnectManager, intervalId } = secureConnectManager()
  const { init: initRemoteIpfsFileManager } = remoteIpfsFileManager()

  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState({
    indexDb: 'Not initialized',
    secureConnect: 'Not initialized',
    remoteIpfsFileManager: 'Not initialized',
  })

  useEffect(() => {
    if (intervalId) {
      setStatus((prev) => ({ ...prev, secureConnect: 'Initialized' }))
    } else {
      setStatus((prev) => ({ ...prev, secureConnect: 'Not initialized' }))
    }
  }, [intervalId])

  const handleInitialize = async () => {
    try {
      // Initialize indexDbStore
      await initIndexedDb('myDatabase')
      setStatus((prev) => ({ ...prev, indexDb: 'Initialized' }))

      // Initialize secureConnectManager with the API key
      initConnectManager({
        api: apiKey,
        discoveryInterval: 60000, // adjust as needed
      })

      // Initialize remoteIpfsFileManager (assuming no additional config needed)
      initRemoteIpfsFileManager()
      setStatus((prev) => ({ ...prev, remoteIpfsFileManager: 'Initialized' }))
    } catch (error) {
      console.error('Error initializing modules:', error)
    }
  }

  return (
    <div>
      <h3>Initialize All Required Modules</h3>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter API Key for SecureConnectManager"
      />
      <button onClick={handleInitialize}>Initialize</button>
      <div>
        <p>IndexDB Status: {status.indexDb}</p>
        <p>SecureConnectManager Status: {status.secureConnect}</p>
        <p>RemoteIpfsFileManager Status: {status.remoteIpfsFileManager}</p>
      </div>
    </div>
  )
}
