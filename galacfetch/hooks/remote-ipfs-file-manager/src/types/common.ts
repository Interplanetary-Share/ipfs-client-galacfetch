import {
  IPaginationAndSortingParams,
  IRemoteFileInfo,
  TFileCreationProps,
  TFileEditProps,
} from './file'

type FileDownloadPromise = {
  resolve: (value: string | PromiseLike<string>) => void
  reject: (reason?: any) => void
}

type FileDownloadPromises = {
  [cid: string]: FileDownloadPromise
}

type TConfig = {
  discoveryInterval: number
}

export type TRemoteStats = {
  currentFiles: Array<string>
  callsUpload: number
  callsDownload: number
  callsDelete: number
  callsInfo: number
  bytesDownload: number
  bytesUpload: number
  bytesDelete: number
  date: string
  token: string
  // updatedAt
  // createdAt
}

export type TRemoteIpfsFileManager = {
  config: TConfig
  fileDownloadPromises: FileDownloadPromises
  init: (config?: TConfig) => void // TODO: make initialization automatic when servers list are modified
  remoteGetFileInfo: (cid: string) => Promise<IRemoteFileInfo | undefined>
  remoteGetFilesInfo: (
    isPublic: boolean,
    queryParams?: IPaginationAndSortingParams
  ) => Promise<IRemoteFileInfo[] | undefined>
  remoteGetFile: (cid: string) => Promise<string>
  remoteUploadFile: (file: File, fileProps: TFileCreationProps) => Promise<any> // TODO add response promises

  remotegetFileExtraProps: (cid: string) => Promise<any> // TODO add response promises
  remoteUpdateFile: (
    cid: string,
    fileprops: TFileEditProps
  ) => Promise<IRemoteFileInfo>

  remoteGetFileStats: (
    cid: string,
    initDate: Date,
    endDate: Date
  ) => Promise<TRemoteStats[] | undefined>
  remoteGetTokenStats: (
    initDate: Date,
    endDate: Date
  ) => Promise<TRemoteStats[] | undefined>
}
