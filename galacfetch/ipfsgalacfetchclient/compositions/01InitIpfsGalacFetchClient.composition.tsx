import React, { useEffect, useState } from 'react'
import {
  ipfsGalactFetchClient,
  secureConnectManager,
} from 'ipfsgalacfetchclient'

export const InitializeAllModules: React.FC = () => {
  const { init } = ipfsGalactFetchClient()
  const { intervalId } = secureConnectManager()
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<string>('Not initialized')

  useEffect(() => {
    if (!intervalId) {
      setStatus('SecureConnectManager not initialized.')
    } else {
      setStatus('SecureConnectManager successfully initialized.')
    }
  }, [intervalId])

  const handleInitialize = async () => {
    try {
      setStatus('Initializing...')
      await init(apiKey, 'myDatabase', 60000)
    } catch (error) {
      console.error('Error initializing modules:', error)
      setStatus('Error initializing modules')
    }
  }

  return (
    <div>
      <h3>Initialize All Modules with ipfsGalactFetchClient</h3>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter API Key for SecureConnectManager"
      />
      <button type="button" onClick={handleInitialize}>
        {status}
      </button>
      <div>{status}</div>
    </div>
  )
}
