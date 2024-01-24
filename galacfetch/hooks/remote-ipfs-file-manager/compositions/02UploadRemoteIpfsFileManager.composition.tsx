import React, { useState } from 'react'
import { remoteIpfsFileManager } from '@intershare/hooks.remote-ipfs-file-manager'

export const UploadFileForm: React.FC = () => {
  const [file, setFile] = useState(null)
  const [fileProps, setFileProps] = useState({
    name: '',
    description: '',
    isPublic: false,
    extraProperties: {},
  })
  const [uploadStatus, setUploadStatus] = useState('')
  const { remoteUploadFile } = remoteIpfsFileManager()

  const handleFileChange = (event) => {
    setFile(event.target.files[0])
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFileProps((prevProps) => ({
      ...prevProps,
      [name]: value,
    }))
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('No file selected.')
      return
    }

    try {
      await remoteUploadFile(file, fileProps)
      setUploadStatus('File uploaded successfully.')
    } catch (error) {
      console.error('Error uploading file:', error)
      setUploadStatus('Error uploading file.')
    }
  }

  return (
    <div>
      <h3>Upload File</h3>
      <input type="file" onChange={handleFileChange} />
      <input
        type="text"
        name="name"
        placeholder="File Name"
        onChange={handleInputChange}
      />
      <textarea
        name="description"
        placeholder="File Description"
        onChange={handleInputChange}
      />
      <label>
        Public
        <input
          type="checkbox"
          name="isPublic"
          onChange={(e) =>
            setFileProps((prevProps) => ({
              ...prevProps,
              isPublic: e.target.checked,
            }))
          }
        />
      </label>
      {/* Aquí puedes añadir más campos para extraProperties si es necesario */}
      <button onClick={handleUpload}>Upload File</button>
      <p>Status: {uploadStatus}</p>
    </div>
  )
}
