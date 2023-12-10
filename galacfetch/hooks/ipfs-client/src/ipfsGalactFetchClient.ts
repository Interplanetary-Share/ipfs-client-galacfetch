import { indexDbStore } from '@intershare/hooks.indexdb'
import { localIpfsFileManager } from '@intershare/hooks.local-ipfs-file-manager'
import { create } from 'zustand'
import {
  IFileRetrievalConfig,
  IFileRetrievalResponse,
  IFileUploadResponse,
  IPaginationAndSortingParams,
  TErrorStatus,
  TFileCreationProps,
  TFileEditProps,
} from './types/file'
import { useRemoteIpfsClient } from './useRemoteIpfsClient' //TODO: change this for an splited library
import { waitForFileReady, wrapperProtect } from './utils/api'

type Store = {
  status: undefined | 'idle' | 'loading' | TErrorStatus
  init: (api: string, repoName: string) => Promise<void>
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

export const ipfsGalactFetchClient = create<Store>()(
  (set): Store => ({
    status: undefined,
    init: async (api: string, dbName = 'galactfetch') => {
      const { init } = useRemoteIpfsClient.getState()
      const { initIndexedDb } = indexDbStore.getState()
      set({ status: 'loading' })
      const response = await init(api).catch((error) => {
        set({
          status: {
            error: 'error',
            message: error,
          },
        })
        return error
      })

      if (response instanceof Error) {
        set({
          status: {
            error: 'error',
            message: response.message,
          },
        })
        return response
      }

      await initIndexedDb(dbName) // Loads in bg, TODO: add loading state and monitor progress.
      set({ status: 'idle' })
      return response
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
    ) =>
      await wrapperProtect(set, async () => {
        const { getLocalFileUrl, findPreloadFile } =
          localIpfsFileManager.getState()
        const { remoteGetFile, remotegetFileExtraProps, remoteGetFileInfo } =
          useRemoteIpfsClient.getState()

        const isFile = await getLocalFileUrl(cid)

        if (!isFile) await remoteGetFile(cid)

        if (config.showBlobUrl) {
          await waitForFileReady(cid)
        }

        const url = config.showBlobUrl ? findPreloadFile(cid)?.url : undefined

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

        const { _id, __v, ...rest } = response

        return rest
      }),
    // TODO: change order queryParams, config to easy the use.
    // TODO: sort by extraparams too.
    getFiles: async (
      isPublic = false,
      config?: IFileRetrievalConfig,
      queryParams?: IPaginationAndSortingParams
    ) =>
      await wrapperProtect(set, async () => {
        const { remoteGetFilesInfo } = useRemoteIpfsClient.getState()
        const { getFile } = ipfsGalactFetchClient.getState()
        const files = await remoteGetFilesInfo(isPublic, queryParams)
        if (!files) {
          console.warn('no files found')
          return []
        }

        const response = await Promise.all(
          files.map(async (file) => {
            const response = await getFile(file.cid, config)
            return response
          })
        )
        return response
      }),

    uploadFile: async (file: File, fileProps: TFileCreationProps) =>
      await wrapperProtect(set, async () => {
        const { remoteUploadFile } = useRemoteIpfsClient.getState()
        return await remoteUploadFile(file, fileProps)
      }),
    updateFile: async (cid: string, fileProps: TFileEditProps) =>
      await wrapperProtect(set, async () => {
        const { remoteUpdateFile } = useRemoteIpfsClient.getState()
        return await remoteUpdateFile(cid, fileProps)
      }),
  })
)
