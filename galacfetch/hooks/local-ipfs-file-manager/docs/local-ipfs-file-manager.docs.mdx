---
description: 'Local IPFS File Manager for managing files with IndexedDB integration'
labels:
  [
    'local file management',
    'IPFS',
    'IndexedDB',
    'file synchronization',
    'react',
  ]
---

## Local IPFS File Manager

This store provides a comprehensive solution for managing files locally while ensuring synchronization with remote IPFS servers. It integrates with IndexedDB for local storage and interacts with remote IPFS servers for file integrity checks and synchronization.

### How to Use

To utilize this store, import and initialize it in your React component.

```javascript
import localIpfsFileManager from '@intershare/hooks.local-ipfs-file-manager'
```

#### Current Types and Interfaces

```typescript
// URL and File Information
export interface IFileUrlInfo {
  url: string
  cid: string
}

export type TConfig = {
  remote: {
    enabled: boolean
    integrity: {
      check: boolean
      sync: boolean
    }
  }
}

export type TLocalIpfsFileManagerStore = {
  urlFileList: IFileUrlInfo[]
  config: TConfig
  setConfig: (newConfig: Partial<TConfig>) => void

  uploadBlobAndCreateUrl: (
    cid: string,
    blob: Blob
  ) => Promise<string | undefined>
  getLocalFileUrl: (cid: string) => Promise<string | undefined>
  removeFileByCid: (cid: string) => Promise<void>

  findPreloadFile: (cid: string) => IFileUrlInfo | undefined
  addNewBlobUrl: (urlFile: IFileUrlInfo) => void
  syncFileWithRemote: (cid: string, blob: Blob) => Promise<void>
}
```

### Configuration

Set or update the store configuration as needed.

```javascript
const { setConfig } = localIpfsFileManager()

setConfig({
  remote: {
    enabled: true,
    integrity: {
      check: true,
      sync: true,
    },
  },
})
```

### Get Local File URL

Retrieve the URL of a local file by its CID.

```javascript
const { getLocalFileUrl } = localIpfsFileManager()

const url = await getLocalFileUrl('yourCID')
```

### Upload Blob and Create URL

Upload a Blob object and create a URL for it.

```javascript
const { uploadBlobAndCreateUrl } = localIpfsFileManager()

const url = await uploadBlobAndCreateUrl('yourCID', blob)
```

### Remove File by CID

Remove a file from local storage by its CID.

```javascript
const { removeFileByCid } = localIpfsFileManager()

await removeFileByCid('yourCID')
```

### Utility Functions

#### Find Preloaded File

Find a preloaded file in the local store.

```javascript
const { findPreloadFile } = localIpfsFileManager()

const file = findPreloadFile('yourCID')
```

#### Add New Blob URL // TODO: Rename method

This method adds new file info to the store. (not the actual file)

```javascript
const { addNewBlobUrl } = localIpfsFileManager()

addNewBlobUrl({
  url: 'yourURL',
  cid: 'yourCID',
})
```

#### Sync File with Remote

Synchronize a local file with its remote version on the IPFS server.

```javascript
const { syncFileWithRemote } = localIpfsFileManager()

await syncFileWithRemote('yourCID')
```

The store ensures efficient management of local files with capabilities like adding, retrieving, and removing files, along with synchronization with remote servers for data integrity and consistency.
