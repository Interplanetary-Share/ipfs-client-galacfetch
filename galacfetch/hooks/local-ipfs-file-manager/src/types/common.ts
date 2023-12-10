// URL and File Information
export interface IFileUrlInfo {
  url: string
  cid: string
}

export type TConfig = {
  remote: {
    enabled: boolean
    integrity: {
      check: boolean
      sync: boolean
    }
  }
}

export type TLocalIpfsFileManagerStore = {
  urlFileList: IFileUrlInfo[]
  config: TConfig
  setConfig: (newConfig: Partial<TConfig>) => void

  uploadBlobAndCreateUrl: (
    cid: string,
    blob: Blob
  ) => Promise<string | undefined>
  getLocalFileUrl: (cid: string) => Promise<string | undefined> // este hace varias cosas, principalmente añade archivo a indexedDB lo obtene y lo añade a los servidores.
  removeFileByCid: (cid: string) => Promise<void>

  // localGetTotalSizeAllFiles: () => Promise<number | undefined>
  // garbageCollect: () => Promise<void>
  findPreloadFile: (cid: string) => IFileUrlInfo | undefined
  addNewBlobUrl: (urlFile: IFileUrlInfo) => void
  syncFileWithRemote: (cid: string, blob: Blob) => Promise<void>
}
