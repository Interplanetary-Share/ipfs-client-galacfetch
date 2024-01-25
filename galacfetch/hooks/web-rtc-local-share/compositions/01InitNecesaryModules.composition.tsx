import React, { useEffect, useState } from 'react'
import { webRTCLocalShare } from '@intershare/hooks.web-rtc-local-share'
import { secureConnectManager } from '@intershare/hooks.secure-connect-manager'
import { indexDbStore } from '@intershare/hooks.indexdb'

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
