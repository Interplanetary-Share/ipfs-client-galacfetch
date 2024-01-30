import React, { useEffect } from 'react'
import { localIpfsFileManager } from '@intershare/hooks.local-ipfs-file-manager'
import { remoteIpfsFileIntegrity } from '@intershare/hooks.remote-ipfs-file-integrity'
import secureConnectManager from '@intershare/hooks.secure-connect-manager'

export const LocalFilesIntegrityCheck: React.FC = () => {
  const { urlFileList, preloadAllLocalFiles } = localIpfsFileManager()
  const { intervalId } = secureConnectManager()
  const { remoteCheckIntegrityFile, syncFileWithRemote, filesChecked } =
    remoteIpfsFileIntegrity()

  // const isIntegrityOk = await remoteCheckIntegrityFile(file.cid)
  useEffect(() => {
    preloadAllLocalFiles()
  }, [intervalId])

  useEffect(() => {
    urlFileList.forEach((file) => {
      remoteCheckIntegrityFile(file.cid)
    })
  }, [urlFileList])

  const handleCheckIntegrity = async (cid) => {
    await syncFileWithRemote(cid)
  }

  if (!intervalId) {
    return (
      <div>
        <p>
          SecureConnectManager is not initialized. Please initialize it first.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3>Local Files Integrity Check</h3>
      <ul>
        {urlFileList.length > 0 ? (
          urlFileList.map((file) => (
            <li
              key={file.cid}
              style={{
                color: filesChecked.includes(file.cid) ? 'black' : 'red',
                backgroundColor: filesChecked.includes(file.cid) ? 'green' : '',
              }}
            >
              {file.cid}{' '}
              <button onClick={() => handleCheckIntegrity(file.cid)}>
                Sync with Remote
              </button>
            </li>
          ))
        ) : (
          <p>
            No local files found. Please add files using localIpfsFileManager
            (will not be able to sync with remote) or with remoteIpfsFileManager
            (will be able to sync with remote).
          </p>
        )}
      </ul>
    </div>
  )
}
