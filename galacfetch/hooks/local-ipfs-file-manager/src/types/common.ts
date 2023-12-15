// URL and File Information
export interface IFileUrlInfo {
  url: string
  cid: string
}

export type TLocalIpfsFileManagerStore = {
  urlFileList: IFileUrlInfo[]
  maxPreloadFiles: number // todo, a

  uploadBlobAndCreateUrl: (
    cid: string,
    blob: Blob
  ) => Promise<string | undefined>
  getLocalFileUrl: (cid: string) => Promise<string | undefined>
  removeFileByCid: (cid: string) => Promise<void>

  findPreloadFile: (cid: string) => IFileUrlInfo | undefined
  addNewBlobUrl: (urlFile: IFileUrlInfo) => void
}
