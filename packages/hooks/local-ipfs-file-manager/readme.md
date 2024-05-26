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

The `localIpfsFileManager` offers a comprehensive solution for managing local files, ensuring efficient synchronization with remote IPFS servers and robust integration with IndexedDB for local storage. This module enhances state management and optimizes interactions with both local and remote databases.

### How to Use

To utilize this module in your React application, import and initialize it as follows:

```javascript
import { localIpfsFileManager } from '@galacfetch/local-ipfs-file-manager'
```

#### Current Types and Interfaces

```typescript
// URL and File Information
export interface IFileUrlInfo {
  url: string
  cid: string
}

export type TLocalIpfsFileManagerStore = {
  urlFileList: IFileUrlInfo[]
  maxPreloadFiles: number
  getLocalFileUrl: (cid: string) => Promise<string | undefined>
  uploadBlobAndCreateUrl: (cid: string, blob: Blob) => Promise<string>
  removeFileByCid: (cid: string) => Promise<void>
  preloadAllLocalFiles: () => Promise<void>
  // Other utility functions...
}
```

### Retrieve Local File URL

Obtain the URL of a local file by its CID:

```javascript
const { getLocalFileUrl } = localIpfsFileManager()

const url = await getLocalFileUrl('yourCID')
```

### Upload Blob and Create URL

Upload a Blob object and generate a corresponding URL:

```javascript
const { uploadBlobAndCreateUrl } = localIpfsFileManager()

const cid = await uploadBlobAndCreateUrl('yourCID', blob)
```

### Remove File by CID

Delete a file from local storage using its CID:

```javascript
const { removeFileByCid } = localIpfsFileManager()

await removeFileByCid('yourCID')
```

### Utility Functions

#### Preload All Local Files

Preload all files stored locally:

```javascript
const { preloadAllLocalFiles } = localIpfsFileManager()

await preloadAllLocalFiles()
```

#### Add New Blob URL

Add new file information to the store (this does not upload the actual file):

```javascript
const { addNewBlobUrl } = localIpfsFileManager()

addNewBlobUrl({
  url: 'yourURL',
  cid: 'yourCID',
})
```

This module ensures efficient management of local files with capabilities such as adding, retrieving, and removing files, along with file loading optimization and memory management.

---

# Notes About Dependent `indexDbStore` Module

## indexDbStore: Managing IndexedDB in React

`indexDbStore` is an effective solution for handling IndexedDB storage operations within React applications. It supports CRUD operations, storage size management, and includes an inbuilt garbage collector for performance optimization.

### Basic Operations

Once `indexDbStore` is initialized in your application, you can perform various storage operations:

#### Saving Data

```javascript
const saveData = async () => {
  // Your data here
  await indexDbStore.getState().saveData('yourID', data, 'yourTable')
}
```

#### Retrieving Data

```javascript
const getData = async () => {
  const data = await indexDbStore.getState().getData('yourID', 'yourTable')
  return data
}
```

#### Removing Data

```javascript
const removeData = async () => {
  await indexDbStore.getState().removeData('yourID', 'yourTable')
}
```

### Advanced Configuration

Customize settings like the garbage collector for enhanced performance:

```javascript
indexDbStore.getState().setConfig({
  // Configuration settings...
})
```

### Considerations

- Ensure IndexedDB is initialized before performing any operations.
- Handle errors and exceptional cases for application stability.
- Include resource cleanup in your React component lifecycle.
