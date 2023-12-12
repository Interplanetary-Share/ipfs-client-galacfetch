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

// Pagination and Sorting Query Parameters
export interface IPaginationAndSortingParams {
  page?: number
  size?: number
  filter?: Record<string, unknown>
  sort?: Record<string, unknown>
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

// Error Status Information
export type TErrorStatus = {
  error: string
  message: string
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

// Server Item Information
export type TServerItem = {
  host: string
  ws: any
  // TODO: WEBRTC ITERATION 2
  //   peerCon: any
  //   dataChan: any
}
