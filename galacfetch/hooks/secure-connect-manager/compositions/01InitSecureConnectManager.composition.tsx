import React, { useEffect, useState } from 'react'
import { secureConnectManager } from '../src/secure-connect-manager'

export const InitSecureConnectManager = (): React.ReactElement => {
  const [status, setStatus] = useState<string>('Not initialized')
  const [apiKey, setApiKey] = useState<string>('')
  const { init, intervalId } = secureConnectManager()

  useEffect(() => {
    if (intervalId) {
      setStatus('SecureConnectManager successfully initialized.')
    } else {
      setStatus('SecureConnectManager not initialized.')
    }
  }, [intervalId])

  return (
    <>
      <input
        onChange={(e) => {
          setApiKey(e.target.value)
        }}
      />
      <button
        onClick={() => {
          setStatus('Loading...')

          init({
            api: apiKey,
            discoveryInterval: 1000,
          })
        }}
      >
        Init SecureConnectManager
      </button>

      <div>{status}</div>
    </>
  )
}
