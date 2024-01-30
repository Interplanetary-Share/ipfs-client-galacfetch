import React, { useState } from 'react'
import { localIpfsFileManager } from '@intershare/hooks.local-ipfs-file-manager'

export const UploadFile: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const { uploadBlobAndCreateUrl, getLocalFileUrl } = localIpfsFileManager()

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const uploadFile = async () => {
    if (!file) {
      setStatusMessage('No file selected')
      return
    }

    try {
      const blob = new Blob([file], { type: file.type })
      const randomCID = Math.random().toString().slice(2) // Random CID for testing
      const cid = await uploadBlobAndCreateUrl(randomCID, blob)

      if (!cid) {
        setStatusMessage('Error uploading file')
        return
      }

      const fileUrl = await getLocalFileUrl(cid)

      if (!fileUrl) {
        setStatusMessage('Error getting file URL')
        return
      }

      setUrl(fileUrl)
      setStatusMessage('File uploaded successfully')
    } catch (error) {
      console.error('Error uploading file:', error)
      setStatusMessage('Error uploading file')
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload File</button>
      {statusMessage && <p>{statusMessage}</p>}
      {url && (
        <p>
          File URL:{' '}
          <a href={url} target="_blank">
            View File
          </a>
        </p>
      )}
    </div>
  )
}
