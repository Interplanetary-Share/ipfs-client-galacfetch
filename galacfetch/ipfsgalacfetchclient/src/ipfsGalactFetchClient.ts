import { indexDbStore } from '@intershare/hooks.indexdb'
import { localIpfsFileManager } from '@intershare/hooks.local-ipfs-file-manager'
import remoteIpfsFileIntegrity from '@intershare/hooks.remote-ipfs-file-integrity'
import {
  type IPaginationAndSortingParams,
  remoteIpfsFileManager,
} from '@intershare/hooks.remote-ipfs-file-manager'
import secureConnectManager from '@intershare/hooks.secure-connect-manager'
import webRTCLocalShare from '@intershare/hooks.web-rtc-local-share'
import { create } from 'zustand'
import type { IFileRetrievalConfig, IFileRetrievalResponse } from './types/file'

type Store = {
  init: (
    api: string,
    dbName: string,
    discoveryInterval?: number
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
}

export const ipfsGalactFetchClient = create<Store>(
  (): Store => ({
    init: async (
      api: string,
      dbName = 'galactfetch',
      discoveryInterval = 60000
    ) => {
      try {
        secureConnectManager.getState().init({ api, discoveryInterval }) // Connect to sockets
        await indexDbStore.getState().initIndexedDb(dbName) // Init indexedDb
        remoteIpfsFileManager.getState().init({ discoveryInterval }) // Init remoteIpfsFileManager // check WS to listen
        webRTCLocalShare.getState().init({ discoveryInterval }) // Init webRTCLocalShare // check WS to listen
        remoteIpfsFileIntegrity.getState().init() // Init remoteIpfsFileIntegrity // check WS to listen
      } catch (error) {
        console.log('Error during initialization')
        console.error(error)
      }
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
  })
)
