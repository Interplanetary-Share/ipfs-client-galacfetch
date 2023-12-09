import { create } from 'zustand'
import {
  bytesToGB,
  chunkBlobAsync,
  fileToBlobUrl,
  isFilePreloaded,
  reassembleBlob,
} from '../utils/file'

// TODO implement webrtc to share data between peers to avoid the use of a centralized database.
import indexDbStore from './indexDb'
import { ipfsGalactFetchClient } from './ipfsGalactFetchClient'
import { objectStores } from '../types/idb'
import { useRemoteIpfsClient } from './useRemoteIpfsClient'

type Store = {
  localGetFile: (cid: string) => Promise<string | undefined>
  localAddFile: (blob: Blob, cid: string) => Promise<string | undefined>
  localRemoveFile: (cid: string) => Promise<boolean>
  localGetAllFiles: () => Promise<string[] | undefined>
  localGetTotalSizeAllFiles: () => Promise<number | undefined>
  garbageCollect: () => Promise<void>
}

export const useLocalIpfsStore = create<Store>(
  (set): Store => ({
    localGetFile: async (cid: string) => {
      const {
        addNewBlobUrl,
        remoteCheckIntegrityFile,
        remoteRestoreIntegrityFile,
      } = useRemoteIpfsClient.getState()
      const { garbageCollect } = useLocalIpfsStore.getState()
      const { urlFileList } = ipfsGalactFetchClient.getState()
      const { iDb, getData } = indexDbStore.getState()
      if (!cid) throw new Error('no cid provided')
      if (!iDb) throw new Error('Indexed DB not initialized')
      if (isFilePreloaded(urlFileList, cid))
        return urlFileList.find((fileLs) => fileLs.cid === cid)?.url
      const fileData = await getData(cid, objectStores.files)
      if (!fileData) return undefined
      const blob = reassembleBlob(fileData.buffers, fileData.type)
      const url = fileToBlobUrl(blob)
      addNewBlobUrl({
        cid,
        url,
      })
      remoteCheckIntegrityFile(cid).then((isFileGoodIntegrity) => {
        if (!isFileGoodIntegrity) {
          remoteRestoreIntegrityFile(blob, cid)
        }
      })

      garbageCollect()

      return url
    },
    localAddFile: async (blob: Blob, cid: string) => {
      // This receives a working blob
      if (!blob) throw new Error('no blob provided')
      if (!cid) throw new Error('no cid provided')
      const { iDb, saveData } = indexDbStore.getState()
      const { addNewBlobUrl, servers } = useRemoteIpfsClient.getState()
      const { garbageCollect } = useLocalIpfsStore.getState()

      if (!iDb) throw new Error('Indexed DB not initialized')
      const buffersChunked = await chunkBlobAsync(blob)
      saveData(
        cid,
        { buffers: buffersChunked, type: blob.type },
        objectStores.files
      )

      servers.forEach((server) => {
        const { dataChan } = server
        if (!dataChan) return
        if (!dataChan.readyState) return
        if (dataChan.readyState !== 'open') return
        dataChan.send(JSON.stringify({ type: 'checkFile', cid }))
      })

      const url = fileToBlobUrl(blob)
      addNewBlobUrl({
        cid,
        url,
      })

      garbageCollect()

      return cid
    },
    localRemoveFile: async (cid: string) => {
      if (!cid) throw new Error('no cid provided')
      const { iDb, removeData } = indexDbStore.getState()
      if (!iDb) throw new Error('Indexed DB not initialized')
      return await removeData(cid, objectStores.files)
    },
    localGetAllFiles: async () => {
      const { iDb, getAllKeys } = indexDbStore.getState()
      if (!iDb) throw new Error('Indexed DB not initialized')
      const localPinnedFiles = [] as string[]
      const allKeys = await getAllKeys(objectStores.files)
      if (!allKeys) return undefined
      allKeys.forEach((key) => {
        localPinnedFiles.push(key as string)
      })
      return localPinnedFiles
    },
    localGetTotalSizeAllFiles: async () => {
      const { iDb, getAllKeys, getData } = indexDbStore.getState()
      if (!iDb) throw new Error('Indexed DB not initialized')
      const allKeys = await getAllKeys(objectStores.files)
      if (!allKeys) return undefined
      let totalSize = 0
      allKeys.forEach(async (key) => {
        const fileData = await getData(key as string, objectStores.files)
        if (!fileData) return
        totalSize += fileData.buffers.reduce((acc, curr) => {
          acc += curr.byteLength
          return acc
        }, 0)
      })
      return totalSize
    },
    garbageCollect: async () => {
      const { localGetAllFiles, localRemoveFile } = useLocalIpfsStore.getState()
      // Check if the total size of the files is bigger than the max size allowed by the user.
      // Get available space in the browser storage. indexedDB

      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then(({ usage, quota }) => {
          console.info(
            `Using ${bytesToGB(usage).toFixed(2)}GB out of ${bytesToGB(
              quota * 0.5
            ).toFixed(2)} GB.`
          )
          // if usage is bigger than quota, remove files until usage is less than quota.
          // 50% of quota
          if (usage > quota * 0.5) {
            console.warn('usage is bigger than quota')
            localGetAllFiles().then((files) => {
              if (!files) return
              localRemoveFile(files[0])
            })
          }
        })
      } else {
        console.warn(
          'Navegador no soporta la API de almacenamiento. ¡Actualízate, causa!'
        )
      }
    },
  })
)
