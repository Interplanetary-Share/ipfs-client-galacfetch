# 🚧 Under Construction 🚧

## Hello! 👋

Thank you for visiting this repository. We're currently hard at work building something amazing. Check back soon for updates!

![Under Construction](https://media.giphy.com/media/3o7aCSPqXE5C6T8tBC/giphy.gif)

### 📅 Upcoming Updates

- **Complete Documentation** - We're in the process of drafting detailed documentation to get you started seamlessly.
- **Usage Examples** - Practical examples will be provided soon to help you better understand the project.
- **Optimizations** - We're working on enhancing efficiency and user experience.

### 🤝 Contributions

If you have ideas or suggestions, we'd love to hear them! Please consider opening an issue or making a pull request.

### 📬 Contact Us

If you have any questions or comments, feel free to [send us a message](mailto:kenneth7e7a@gmail.com).

# 🌌 ipfsGalactFetchClient - A React Hook for IPFS

A React Hook that connects to galacfetch IPFS nodes to manage files on the IPFS network.

![npm](https://img.shields.io/npm/v/@interplanetary-share/hooks.ipfs-client)
![downloads](https://img.shields.io/npm/dm/@interplanetary-share/hooks.ipfs-client)
![license](https://img.shields.io/npm/l/@interplanetary-share/hooks.ipfs-client)

## 🚀 Features

- Connect to galacfetch IPFS nodes.
- Manage files on the IPFS network.
- Local cache to save bandwidth and improve performance.
- Interact with the galacfetch IPFS nodes directly.

## 🏷️ Labels

`hook`, `ipfs`, `galacfetch`, `react`, `interplanetary`, `file`, `storage`, `decentralized`

## 📦 Installation

```bash
npm install ipfsgalactfetchclient
```

## 📖 Usage

### Component usage

In this example, we use `ipfsGalactFetchClient` hook that interacts with `useLocalIpfsStore` and `useRemoteIpfsStore` hooks to manage files on the IPFS network.

```javascript
// Main hook usage
const { status, init, getFile, getFiles, uploadFile, urlFileList } =
  ipfsGalactFetchClient();

// Interact with other hooks directly
const { localGetFile, localAddFile, localRemoveFile, localGetAllFiles } =
  useLocalIpfsStore();
const {
  servers,
  init,
  addNewBlobUrl,
  api,
  remoteCheckIntegrityFile,
  remoteGetFileInfo,
  remoteGetFilesInfo,
  remoteGetFile,
  remoteUploadFile,
  remoteRestoreIntegrityFile,
  remotegetFileExtraProps,
} = useRemoteIpfsStore();
```

### Initialization

Initialize the hook by calling the `init` function. This will connect to the IPFS galacfetch nodes.

```javascript
const api = 'ABC123';
const repoName = 'ExampleRepoName';

useEffect(() => {
  init(api, repoName);
}, []);
```

### File Management

Manage your files on the IPFS network with ease.

- **getFile**: Retrieve a file from the IPFS network.
- **getFiles**: Get a list of files from the IPFS network.
- **uploadFile**: Upload a file to the IPFS network.
- **urlFileList**: Get the list of files that are in memory and in the local IPFS node.
- **updateFile**: Update the information or extra properties of a file.

## 📜 Documentation

For detailed documentation, examples, and API references, please visit [our official documentation](#).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](#).

## 📝 License

This project is [MIT](#) licensed.

## TODOS:

### Local:

- Implement WebRTC to share data between nodes
- Implement a garbage Collector to remove old data
- set config on init Client (use local cache, max cache size, file size limit, etc)
