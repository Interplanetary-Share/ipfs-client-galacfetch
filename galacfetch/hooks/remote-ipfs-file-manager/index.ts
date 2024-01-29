import { remoteIpfsFileManager } from './src/remote-ipfs-file-manager'
import {
  IDownloadChunkInfo,
  IPaginationAndSortingParams,
  IRemoteFileInfo,
  TErrorStatus,
  TFileCreationProps,
  TFileEditProps,
} from './src/types/file'

import { TRemoteStats } from './src/types/common'

export { remoteIpfsFileManager }

export type {
  IDownloadChunkInfo,
  IPaginationAndSortingParams,
  IRemoteFileInfo,
  TErrorStatus,
  TFileCreationProps,
  TFileEditProps,
  TRemoteStats,
}

export default remoteIpfsFileManager
