import {
  IPaginationAndSortingParams,
  IRemoteFileInfo,
  TErrorStatus,
  TFileCreationProps,
  TFileEditProps,
  TServerItem,
} from './file'

type FileDownloadPromise = {
  resolve: (value: string | PromiseLike<string>) => void
  reject: (reason?: any) => void
}

type FileDownloadPromises = {
  [cid: string]: FileDownloadPromise
}

export type TRemoteIpfsFileManager = {
  fileDownloadPromises: FileDownloadPromises
  status: undefined | 'idle' | 'loading' | TErrorStatus
  servers: TServerItem[]
  init: (api: string) => Promise<void>
  // addNewBlobUrl: (urlFile: IFileUrlInfo) => void // MOVED TO LOCALIPFSSTORE
  api: string | null
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
  connectToSocket: (url: string, api: string) => Promise<any>
}
