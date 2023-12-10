import { ObjectStoresEnum, indexDbStore } from '@intershare/hooks.indexdb'
import { useRemoteIpfsClient } from '@intershare/hooks.ipfs-client' //TODO: change this for an splited library
import { create } from 'zustand'
import {
  IFileUrlInfo,
  TConfig,
  TLocalIpfsFileManagerStore,
} from './types/common'
import {
  blobBufferToFile,
  chunkBlobAsync,
  fileToBlobUrl,
  reassembleBlob,
} from './utils/file'

import axios from 'axios'
import { restoreIntegrity } from './types/api'

// TODO implement webrtc to share data between peers to avoid the use of a centralized database.

const localIpfsFileManager = create<TLocalIpfsFileManagerStore>(
  (set): TLocalIpfsFileManagerStore => ({
    urlFileList: [],
    config: {
      remote: {
        enabled: false,
        integrity: {
          check: false,
          sync: false,
        },
      },
    },
    setConfig: (newConfig: Partial<TConfig>) => {
      set((prevState) => ({
        config: {
          ...prevState.config,
          ...newConfig,
          remote: {
            ...prevState.config.remote,
            ...newConfig.remote,
          },
        },
      }))
    },
    getLocalFileUrl: async (cid: string) => {
      const { addNewBlobUrl, findPreloadFile, config } =
        localIpfsFileManager.getState()
      const { iDb, getData } = indexDbStore.getState()

      if (!cid) {
        throw new Error('No CID provided')
      }

      if (!iDb) {
        throw new Error('indexDbStore not initialized')
      }

      const preloadedFileUrl = findPreloadFile(cid)
      if (preloadedFileUrl) return preloadedFileUrl.url

      const fileData = await getData(cid, ObjectStoresEnum.files)
      if (!fileData) {
        return undefined
      }

      const blob = reassembleBlob(fileData.buffers, fileData.type)
      const url = fileToBlobUrl(blob)
      addNewBlobUrl({ cid, url })

      if (config.remote.enabled && config.remote.integrity.check) {
        const { remoteCheckIntegrityFile } = useRemoteIpfsClient.getState()

        const { syncFileWithRemote } = localIpfsFileManager.getState()

        const isFileGoodIntegrity = await remoteCheckIntegrityFile(cid)
        if (!isFileGoodIntegrity && config.remote.integrity.sync) {
          await syncFileWithRemote(cid, blob)
        }
      }

      return url
    },

    uploadBlobAndCreateUrl: async (cid, blob) => {
      if (!blob) {
        throw new Error('No blob provided')
      }

      if (!cid) {
        throw new Error('No CID provided')
      }

      const { iDb, saveData } = indexDbStore.getState()
      const { addNewBlobUrl, config } = localIpfsFileManager.getState()

      if (!iDb) {
        throw new Error('Indexed DB not initialized')
      }

      const buffersChunked = await chunkBlobAsync(blob)
      await saveData(
        cid,
        { buffers: buffersChunked, type: blob.type },
        ObjectStoresEnum.files
      )

      const url = fileToBlobUrl(blob)
      addNewBlobUrl({ cid, url })

      if (config.remote.enabled && config.remote.integrity.check) {
        const { servers } = useRemoteIpfsClient.getState()
        servers.forEach((server) => {
          if (server.dataChan?.readyState === 'open') {
            server.dataChan.send(JSON.stringify({ type: 'checkFile', cid }))
          }
        })
      }

      return cid
    },

    removeFileByCid: async (cid: string) => {
      if (!cid) {
        throw new Error('No CID provided')
      }

      const { iDb, removeData } = indexDbStore.getState()

      if (!iDb) {
        throw new Error('Indexed DB not initialized')
      }

      await removeData(cid, ObjectStoresEnum.files).catch(() => {
        throw new Error(`Failed to remove file with CID: ${cid}`)
      })

      const { urlFileList } = localIpfsFileManager.getState()
      const newUrlFileList = urlFileList.filter((file) => file.cid !== cid)
      localIpfsFileManager.setState({ urlFileList: newUrlFileList })
    },

    // Utils
    findPreloadFile: (cid: string) => {
      const { urlFileList } = localIpfsFileManager.getState()
      return urlFileList.find((file) => file.cid === cid)
    },
    addNewBlobUrl: (blobToAdd: IFileUrlInfo) => {
      const { urlFileList, findPreloadFile } = localIpfsFileManager.getState()

      const preloadedFileUrl = findPreloadFile(blobToAdd.cid)
      if (preloadedFileUrl) return

      localIpfsFileManager.setState({
        urlFileList: [...urlFileList, blobToAdd],
      })
    },

    // TODO: add testing for  this method
    syncFileWithRemote: async (cid: string) => {
      const { api, remoteGetFileInfo } = useRemoteIpfsClient.getState()
      const { iDb, getData } = indexDbStore.getState()

      try {
        const infoFile = await remoteGetFileInfo(cid)
        if (!infoFile) {
          throw new Error(
            `No se pudo obtener información del archivo para CID: ${cid}`
          )
        }
        const { serverAlias } = infoFile

        if (!iDb) {
          throw new Error('Indexed DB not initialized')
        }

        const fileData = await getData(cid, ObjectStoresEnum.files)
        if (!fileData) {
          throw new Error(`Archivo no encontrado en IndexedDB para CID: ${cid}`)
        }

        const blob = reassembleBlob(fileData.buffers, fileData.type)
        const file = blobBufferToFile(cid, blob)
        const formData = new FormData()
        formData.append('file', file)

        const response = await axios.post(
          `${restoreIntegrity}/${serverAlias.trim()}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              authorization: `Bearer ${api}`,
            },
          }
        )

        return response.data
      } catch (err) {
        console.error(`Error en syncFileWithRemote para CID: ${cid}`, err)
        throw err
      }
    },
  })
)

export default localIpfsFileManager
