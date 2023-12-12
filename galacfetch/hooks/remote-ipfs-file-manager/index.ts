import { remoteIpfsFileManager } from './src/remote-ipfs-file-manager'
import {
  IDownloadChunkInfo,
  IPaginationAndSortingParams,
  IRemoteFileInfo,
  TErrorStatus,
  TFileCreationProps,
  TFileEditProps,
} from './src/types/file'

export { remoteIpfsFileManager }

export type {
  IDownloadChunkInfo,
  IPaginationAndSortingParams,
  IRemoteFileInfo,
  TErrorStatus,
  TFileCreationProps,
  TFileEditProps,
}

export default remoteIpfsFileManager
