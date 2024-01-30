import { secureConnectManager } from '@intershare/hooks.secure-connect-manager'
import React from 'react'

export const GetConfigConnectManager = (): React.ReactElement => {
  const { config, urlsDiscovered, intervalId } = secureConnectManager()

  return (
    <>
      <div>
        Current settings:
        <table
          style={{
            border: '1px solid black',
            padding: '10px',
          }}
        >
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(config).map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>

          <tbody>
            <tr>
              <td>urlsDiscovered</td>
              <td>{JSON.stringify(urlsDiscovered)}</td>
            </tr>

            <tr>
              <td>intervalId</td>
              <td>{typeof intervalId === 'number' ? intervalId : null}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
