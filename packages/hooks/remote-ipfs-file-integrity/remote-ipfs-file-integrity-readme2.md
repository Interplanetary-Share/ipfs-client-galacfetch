# `remoteIpfsFileIntegrity` Library Documentation

## Overview

`remoteIpfsFileIntegrity` is a React Hook tailored to manage the integrity of files within a remote IPFS filesystem. It allows for periodic checks of file integrity, synchronization of local files with remote servers, and configuration of check intervals, ensuring consistency and reliability of data.

## Key Features

- **File Integrity Checks**: Validates the integrity of files stored in a remote IPFS node.
- **Local and Remote Synchronization**: Syncs local files with their remote counterparts when discrepancies are detected.
- **Configurable Check Intervals**: Allows setting of intervals for automatic file integrity checks.

## Usage

### Initializing the Hook

```tsx
import { remoteIpfsFileIntegrity } from '@galacfetch/remote-ipfs-file-integrity'

export function MyComponent() {
  const { init, setConfig } = remoteIpfsFileIntegrity()

  // Initialize the integrity check process with specific configuration
  useEffect(() => {
    init()
    setConfig({ enabled: true, interval: 60000 }) // Interval in milliseconds
  }, [])
}
```

### Checking and Synchronizing File Integrity

```tsx
const { remoteCheckIntegrityFile, syncFileWithRemote } =
  remoteIpfsFileIntegrity()

// To check and synchronize a file's integrity
const handleIntegrityCheck = async (cid) => {
  const isIntegrityOk = await remoteCheckIntegrityFile(cid)
  if (!isIntegrityOk) {
    await syncFileWithRemote(cid) // Synchronize if integrity check fails
  }
}
```

### Hook Functions

- `init()`: Initializes the integrity check process with configurable settings.
- `setConfig(newConfig: Partial<Tconfig>)`: Updates the configuration for the integrity check, including enabling/disabling and interval settings.
- `remoteCheckIntegrityFile(cid: string)`: Checks the integrity of a file on the remote server using its CID.
- `syncFileWithRemote(cid: string)`: Synchronizes a local file with the remote version if integrity checks fail.

## Dependencies

`remoteIpfsFileIntegrity` relies on the following modules for its operation:

- `indexDbStore`: For accessing and managing local file data.
- `localIpfsFileManager`: To handle local file management and URL creation.
- `remoteIpfsFileManager`: Used for retrieving file information from the remote IPFS node.
- `secureConnectManager`: Manages secure WebSocket connections essential for file integrity checks and data synchronization.

## Contributing

Contributions to `remoteIpfsFileIntegrity` are encouraged. If you have suggestions for improvements or bug fixes, please submit a pull request or open an issue on our GitHub repository:

- [Submit a Pull Request](https://github.com/Interplanetary-Share/ipfs-client-galacfetch/pulls)
- [Report an Issue](https://github.com/Interplanetary-Share/ipfs-client-galacfetch/issues)
