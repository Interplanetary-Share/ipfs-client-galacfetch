import { ObjectStoresEnum, indexDbStore } from '@intershare/hooks.indexdb'
import {
  chunkBlobAsync,
  fileToBlobUrl,
  reassembleBlob,
} from '@intershare/utils.general'
import { create } from 'zustand'
import { IFileUrlInfo, TLocalIpfsFileManagerStore } from './types/common'

// TODO implement webrtc to share data between peers to avoid the use of a centralized database.

const localIpfsFileManager = create<TLocalIpfsFileManagerStore>(
  (): TLocalIpfsFileManagerStore => ({
    urlFileList: [],
    maxPreloadFiles: 10,
    getLocalFileUrl: async (cid: string) => {
      const { addNewBlobUrl, findPreloadFile } = localIpfsFileManager.getState()
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
      const { addNewBlobUrl } = localIpfsFileManager.getState()

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

      if (
        urlFileList.length > localIpfsFileManager.getState().maxPreloadFiles
      ) {
        const urlsToRevoke = urlFileList.slice(
          0,
          urlFileList.length - localIpfsFileManager.getState().maxPreloadFiles
        )
        urlsToRevoke.forEach((urlFile) => {
          URL.revokeObjectURL(urlFile.url)
        })
        const newUrlFileList = urlFileList.slice(
          urlFileList.length - localIpfsFileManager.getState().maxPreloadFiles
        )
        localIpfsFileManager.setState({ urlFileList: newUrlFileList })
      }
    },

    preloadAllLocalFiles: async () => {
      const { iDb, getAllKeys } = indexDbStore.getState()

      if (!iDb) {
        throw new Error('Indexed DB not initialized')
      }

      const allCids = (await getAllKeys(ObjectStoresEnum.files)) || []

      const { getLocalFileUrl } = localIpfsFileManager.getState()

      const promises = allCids.map(async (cid) => {
        const normalizedCid = cid as string
        await getLocalFileUrl(normalizedCid)
      })

      await Promise.all(promises)

      return
    },
  })
)

export default localIpfsFileManager
