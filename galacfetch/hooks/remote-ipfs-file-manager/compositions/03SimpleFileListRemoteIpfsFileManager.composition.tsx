import React, { useEffect, useState } from 'react'
import {
  IRemoteFileInfo,
  remoteIpfsFileManager,
} from '@intershare/hooks.remote-ipfs-file-manager'
import secureConnectManager from '@intershare/hooks.secure-connect-manager'

export const FilesListWithFilter: React.FC = () => {
  const [files, setFiles] = useState<IRemoteFileInfo[]>([])
  const [isPublicFilter, setIsPublicFilter] = useState(false)
  const { remoteGetFilesInfo } = remoteIpfsFileManager()
  const { intervalId } = secureConnectManager()

  useEffect(() => {
    handleFilterChange({ target: { checked: false } })
  }, [intervalId])

  const handleFilterChange = async (event) => {
    setIsPublicFilter(event.target.checked)

    try {
      // Aplicar el filtro isPublic a la petición
      const filesInfo = await remoteGetFilesInfo(event.target.checked)

      if (!filesInfo) {
        console.error('Error fetching files')
        return
      }
      setFiles(filesInfo)
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  if (!intervalId) {
    return <div>Connect to SecureConnectManager first</div>
  }

  return (
    <div>
      <h3>Files List</h3>
      <label>
        Show Public Only
        <input
          type="checkbox"
          name="isPublic"
          checked={isPublicFilter}
          onChange={handleFilterChange}
        />
      </label>
      <div>
        {files.map((file) => (
          <div key={file.cid}>
            <div>CID: {file.cid}</div>
            <div>Filename: {file.name}</div>
            <div>Size: {file.size}</div>
            <div>Is Public: {file.isPublic ? 'Yes' : 'No'}</div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  )
}
