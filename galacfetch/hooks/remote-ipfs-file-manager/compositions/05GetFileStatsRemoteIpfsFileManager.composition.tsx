import React, { useState } from 'react'
import {
  TRemoteStats,
  remoteIpfsFileManager,
} from '@intershare/hooks.remote-ipfs-file-manager'
import secureConnectManager from '@intershare/hooks.secure-connect-manager'

export const GetFileStatsRemoteIpfsFileManager: React.FC = () => {
  const [tokenStats, setTokenStats] = useState<TRemoteStats[]>()
  const [cid, setCid] = useState<string>('')
  const [initialDate, setInitialDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  )
  const [finalDate, setFinalDate] = useState<Date>(new Date())

  const { remoteGetTokenStats } = remoteIpfsFileManager()
  const {
    config: { api },
    intervalId,
  } = secureConnectManager()

  if (!intervalId) {
    return <div>Connect to SecureConnectManager first</div>
  }

  return (
    <div>
      <div>CID To look for: {cid}</div>
      <input type="text" value={cid} onChange={(e) => setCid(e.target.value)} />
      <div>Initial Date: {initialDate.toDateString()}</div>
      <input
        type="date"
        onChange={(e) => {
          const date = new Date(e.target.value)
          setInitialDate(date)
        }}
      />
      <div>Final Date: {finalDate.toDateString()}</div>
      <input
        type="date"
        onChange={(e) => {
          const date = new Date(e.target.value)
          setFinalDate(date)
        }}
      />
      <input
        type="button"
        value="Refresh"
        onClick={() =>
          remoteGetTokenStats(initialDate, finalDate).then((tokenStats) => {
            if (!tokenStats) {
              console.error('Error fetching stats')
              return
            }
            setTokenStats(tokenStats)
          })
        }
      />
      <hr />

      {tokenStats?.map((tokenStat, i) => (
        <div
          key={i}
          style={{
            border: '1px solid black',
            padding: '10px',
            margin: '10px',
          }}
        >
          <div>Date: {tokenStat.date}</div>
          <div>Token: {tokenStat.token}</div>
          <div>Files: {tokenStat.currentFiles}</div>
          <h3>Stats Bytes</h3>
          <div>Bytes Uploaded: {tokenStat.bytesUpload}</div>
          <div>Bytes Downloaded: {tokenStat.bytesDownload}</div>
          <div>Bytes Deleted: {tokenStat.bytesDelete}</div>
          <div>Files Deleted: {tokenStat.callsDelete}</div>
          <h3>Stats Calls</h3>
          <div>Calls Upload: {tokenStat.callsUpload}</div>
          <div>Calls Download: {tokenStat.callsDownload}</div>
          <div>Calls Delete: {tokenStat.callsDelete}</div>
          <div>Calls Info: {tokenStat.callsInfo}</div>
        </div>
      ))}
    </div>
  )
}
