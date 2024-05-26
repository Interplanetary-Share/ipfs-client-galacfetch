import { IRemoteFileInfo } from '@galacfetch/remote-ipfs-file-manager'

// Configuration for File Retrieval
export interface IFileRetrievalConfig {
  showBlobUrl?: boolean
  showInfoFile?: boolean
  showExtraProps?: boolean
}

export interface IFileRetrievalResponse extends IRemoteFileInfo {
  url?: string
  extraProperties?: Record<string, unknown>
}

export interface IFileUploadResponse {
  message: string
  meta: {
    cid: string
    name: string
    description: string
    serverAlias: string
    size: number
    type: string
  }
}
