import { indexDbStore } from '@intershare/hooks.indexdb'
import { localIpfsFileManager } from '@intershare/hooks.local-ipfs-file-manager'
import {
  IPaginationAndSortingParams,
  remoteIpfsFileManager,
  TFileCreationProps,
  TFileEditProps,
} from '@intershare/hooks.remote-ipfs-file-manager'
import secureConnectManager from '@intershare/hooks.secure-connect-manager'
import webRTCLocalShare from '@intershare/hooks.web-rtc-local-share'
import { create } from 'zustand'
import {
  IFileRetrievalConfig,
  IFileRetrievalResponse,
  IFileUploadResponse,
} from './types/file'

type Store = {
  init: (
    api: string,
    repoName: string,
    discoveryInterval: number
  ) => Promise<void>
  getFile: (
    cid: string,
    config?: IFileRetrievalConfig
  ) => Promise<IFileRetrievalResponse>
  getFiles: (
    isPublic?: boolean,
    config?: IFileRetrievalConfig,
    queryParams?: IPaginationAndSortingParams
  ) => Promise<IFileRetrievalResponse[]>
  uploadFile: (
    file: File,
    fileProps: TFileCreationProps
  ) => Promise<IFileUploadResponse>
  updateFile: (
    cid: string,
    fileprops: TFileEditProps
  ) => Promise<IFileRetrievalResponse>
}

export const ipfsGalactFetchClient = create<Store>(
  (): Store => ({
    init: async (
      api: string,
      dbName = 'galactfetch',
      discoveryInterval = 60000
    ) => {
      secureConnectManager.getState().init({ api, discoveryInterval }) // Connect to sockets
      await indexDbStore.getState().initIndexedDb(dbName) // Init indexedDb
      remoteIpfsFileManager.getState().init({ discoveryInterval }) // Init remoteIpfsFileManager // check WS to listen
      webRTCLocalShare.getState().init({ discoveryInterval }) // Init webRTCLocalShare // check WS to listen
    },
    // TODO: eliminar el token de todas las respuestas posibles de archivos.
    getFile: async (
      cid,
      config = {
        showBlobUrl: true,
        showInfoFile: true,
        showExtraProps: true,
        // TODO add isPublic Scope
      }
    ) => {
      const { getLocalFileUrl } = localIpfsFileManager.getState()
      const { remoteGetFile, remotegetFileExtraProps, remoteGetFileInfo } =
        remoteIpfsFileManager.getState()

      let url

      if (config.showBlobUrl) {
        const preloadUrl = await getLocalFileUrl(cid)

        if (!preloadUrl) {
          url = await remoteGetFile(cid)
        } else {
          url = preloadUrl
        }
      } else {
        remoteGetFile(cid)
      }

      const info = config.showInfoFile
        ? await remoteGetFileInfo(cid)
        : undefined
      const extraProps = config.showExtraProps
        ? await remotegetFileExtraProps(cid)
        : undefined

      const response = {
        url,
        ...info,
        ...extraProps,
      }
      const { _id, __v, ...rest } = response // eslint-disable-line

      return rest
    },
    // TODO: change order queryParams, config to easy the use.
    // TODO: sort by extraparams too.
    getFiles: async (
      isPublic = false,
      config?: IFileRetrievalConfig,
      queryParams?: IPaginationAndSortingParams
    ) => {
      const { remoteGetFilesInfo } = remoteIpfsFileManager.getState()
      const { getFile } = ipfsGalactFetchClient.getState()
      const files = await remoteGetFilesInfo(isPublic, queryParams)
      if (!files) {
        console.warn('no files found')
        return []
      }

      const response = await Promise.all(
        files.map(async (file) => {
          const fileResponse = await getFile(file.cid, config)
          return fileResponse
        })
      )

      return response
    },

    uploadFile: async (file, fileProps) => {
      const { remoteUploadFile } = remoteIpfsFileManager.getState()
      const response = await remoteUploadFile(file, fileProps)
      return response
    },

    updateFile: async (cid: string, fileProps: TFileEditProps) => {
      const { remoteUpdateFile } = remoteIpfsFileManager.getState()
      const response = await remoteUpdateFile(cid, fileProps)
      return response
    },
  })
)
