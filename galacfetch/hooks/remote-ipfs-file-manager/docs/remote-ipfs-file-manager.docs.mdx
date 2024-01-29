# `remoteIpfsFileManager` Library Documentation

## Overview

`remoteIpfsFileManager`, a component of the `@intershare/hooks` collection, enhances the handling of remote file operations in React applications via the InterPlanetary File System (IPFS). It focuses on efficient file uploading, downloading, metadata management, and interactivity with remote IPFS nodes, while utilizing WebSocket connections for data transfer.

## Key Features

- **Enhanced File Management**: Facilitates the upload and download of files to and from remote IPFS nodes.
- **Metadata Management and Extended Capabilities**: Offers comprehensive handling of file properties including file statistics and metadata updates.
- **WebSocket Integration**: Works in conjunction with `secureConnectManager` for reliable WebSocket communication with remote servers.

## Initialization

To set up the manager:

```tsx
import React, { useEffect, useState } from 'react'
import { indexDbStore } from '@intershare/hooks.indexdb'
import { secureConnectManager } from '@intershare/hooks.secure-connect-manager'
import { remoteIpfsFileManager } from '@intershare/hooks.remote-ipfs-file-manager'

export const InitializeAllModules: React.FC = () => {
  const { initIndexedDb } = indexDbStore()
  const { init: initConnectManager, intervalId } = secureConnectManager()
  const { init: initRemoteIpfsFileManager } = remoteIpfsFileManager()

  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState({
    indexDb: 'Not initialized',
    secureConnect: 'Not initialized',
    remoteIpfsFileManager: 'Not initialized',
  })

  useEffect(() => {
    if (intervalId) {
      setStatus((prev) => ({ ...prev, secureConnect: 'Initialized' }))
    } else {
      setStatus((prev) => ({ ...prev, secureConnect: 'Not initialized' }))
    }
  }, [intervalId])

  const handleInitialize = async () => {
    try {
      // Initialize indexDbStore
      await initIndexedDb('myDatabase')
      setStatus((prev) => ({ ...prev, indexDb: 'Initialized' }))

      // Initialize secureConnectManager with the API key
      initConnectManager({
        api: apiKey,
        discoveryInterval: 60000, // adjust as needed
      })

      // Initialize remoteIpfsFileManager (assuming no additional config needed)
      initRemoteIpfsFileManager()
      setStatus((prev) => ({ ...prev, remoteIpfsFileManager: 'Initialized' }))
    } catch (error) {
      console.error('Error initializing modules:', error)
    }
  }

  return (
    <div>
      <h3>Initialize All Required Modules</h3>
      <input
        type="text"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Enter API Key for SecureConnectManager"
      />
      <button onClick={handleInitialize}>Initialize</button>
      <div>
        <p>IndexDB Status: {status.indexDb}</p>
        <p>SecureConnectManager Status: {status.secureConnect}</p>
        <p>RemoteIpfsFileManager Status: {status.remoteIpfsFileManager}</p>
      </div>
    </div>
  )
}
```

## File Operations

### Uploading Files

```tsx
const file = /* File object */;
const fileProps = {
  name: 'example.txt',
  description: 'Description of the file',
  extraProperties: { /* Custom properties */ },
  isPublic: true,
};

remoteIpfsFileManager().remoteUploadFile(file, fileProps)
  .then(data => console.log('File uploaded:', data))
  .catch(error => console.error('Error uploading file:', error));
```

### Downloading Files

```tsx
const cid = 'uniqueCID' // File CID

remoteIpfsFileManager()
  .remoteGetFile(cid)
  .then((url) => console.log('File download URL:', url))
  .catch((error) => console.error('Error downloading file:', error))
```

### Managing File Metadata

```tsx
const updatedProps = {
  name: 'updatedName.txt',
  description: 'New file description',
  // Additional properties
}

// Update metadata
remoteIpfsFileManager()
  .remoteUpdateFile('uniqueCID', updatedProps)
  .then((data) => console.log('File metadata updated:', data))
  .catch((error) => console.error('Error updating file metadata:', error))

// Retrieve extra properties
remoteIpfsFileManager()
  .remotegetFileExtraProps('uniqueCID')
  .then((data) => console.log('Extra properties:', data))
  .catch((error) => console.error('Error retrieving extra properties:', error))
```

## New Features

### File Statistics

Provides methods for retrieving statistical data of files, enhancing monitoring and analysis capabilities.

```tsx
// Fetch file statistics
remoteIpfsFileManager()
  .remoteGetFileStats('uniqueCID', startDate, endDate)
  .then((stats) => console.log('File statistics:', stats))
  .catch((error) => console.error('Error fetching file stats:', error))

// Fetch token usage statistics
remoteIpfsFileManager()
  .remoteGetTokenStats(startDate, endDate)
  .then((stats) => console.log('Token statistics:', stats))
  .catch((error) => console.error('Error fetching token stats:', error))
```

## Advanced Features

### WebSocket Connection Management

`remoteIpfsFileManager` collaborates with `secureConnectManager` to facilitate WebSocket connections for file transfers, ensuring robust communication with remote servers saving bandwidth and time.

### File Information Retrieval

Allows querying of file information, both individually and collectively, with optional public visibility filters and query parameters for advanced search and sorting.

## Compositions Explanation

### Initialization of All Required Modules

A React composition to initialize `remoteIpfsFileManager` alongside other essential modules such as `secureConnectManager` and `indexDbStore`.

### File Upload Form

Provides a user interface for selecting and uploading files through `remoteIpfsFileManager`, including handling file metadata.

### Files List with Filters

Enables users to view a list of files, applying filters to search and retrieve files from the backend using `remoteIpfsFileManager`.

## Contributing

Contributions to `remoteIpfsFileManager` are welcome. For suggestions or bug fixes, please submit a pull request or open an issue on our GitHub repository:

- [Submit a Pull Request](https://github.com/Interplanetary-Share/ipfs-client-galacfetch/pulls)
- [Report an Issue](https://github.com/Interplanetary-Share/ipfs-client-galacfetch/issues)
