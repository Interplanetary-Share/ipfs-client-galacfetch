// URL and File Information
export interface IFileUrlInfo {
  url: string
  cid: string
}

// Configuration for File Retrieval
export interface IFileRetrievalConfig {
  showBlobUrl?: boolean
  showInfoFile?: boolean
  showExtraProps?: boolean
}
// Pagination and Sorting Query Parameters
export interface IPaginationAndSortingParams {
  page?: number
  size?: number
  filter?: Record<string, unknown>
  sort?: Record<string, unknown>
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

// Error Status Information
export type TErrorStatus = {
  error: string
  message: string
}

// Remote File Information
// TODO: delete from response _v and _id
export type IRemoteFileInfo = {
  cid: string
  name: string
  description: string
  type: string
  size: number
  token: string
  serverAlias: string
  isPublic: boolean
  updatedAt: string
  createdAt: string
}

// Properties for File Creation
export type TFileCreationProps = {
  name: string
  description: string
  isPublic: boolean
  extraProperties?: Record<string, unknown>
}

// Properties for File Editing
export type TFileEditProps = Partial<TFileCreationProps>

// Download Chunk Information
export interface IDownloadChunkInfo {
  status: number // 1: start, 2: downloading, 3: end 4: error 0: unknown 5: canceled 6: paused
  chunk: any
  progress: number
  sizeSent: number
  // Fileinfo
  cid: string
  name: string
  type: string
  size: number
}

// Server Item Information
export type TServerItem = {
  host: string
  ws: any
}
