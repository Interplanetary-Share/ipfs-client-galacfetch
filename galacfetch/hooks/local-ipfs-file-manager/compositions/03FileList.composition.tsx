import React, { useEffect } from 'react'
import { localIpfsFileManager } from '@intershare/hooks.local-ipfs-file-manager'
import indexDbStore from '@intershare/hooks.indexdb'

export const FileList: React.FC = () => {
  const { urlFileList, removeFileByCid, preloadAllLocalFiles } =
    localIpfsFileManager()
  const { getAllKeys, iDb } = indexDbStore()

  useEffect(() => {
    preloadAllLocalFiles()
  }, [iDb])

  const handleDelete = async (cid) => {
    try {
      await removeFileByCid(cid)
      // No necesitas actualizar el estado aquí ya que urlFileList se actualiza automáticamente
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  return (
    <div>
      <h2>Stored Files</h2>
      <ul>
        {urlFileList.map((file) => (
          <li key={file.cid}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.cid}
            </a>
            <button onClick={() => handleDelete(file.cid)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
