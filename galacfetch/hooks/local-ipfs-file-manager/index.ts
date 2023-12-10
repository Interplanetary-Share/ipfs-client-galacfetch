import localIpfsFileManager from './src/local-ipfs-file-manager'
import {
  IFileUrlInfo,
  TConfig,
  TLocalIpfsFileManagerStore,
} from './src/types/common'
import {
  bytesToGB,
  chunkBlobAsync,
  fileToBlobUrl,
  reassembleBlob,
  blobBufferToFile,
} from './src/utils/file'

export { localIpfsFileManager }
export default localIpfsFileManager
export type { IFileUrlInfo, TConfig, TLocalIpfsFileManagerStore }

// Utils
export {
  bytesToGB,
  chunkBlobAsync,
  fileToBlobUrl,
  reassembleBlob,
  blobBufferToFile,
}
