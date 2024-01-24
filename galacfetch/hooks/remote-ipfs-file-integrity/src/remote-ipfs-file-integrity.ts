import indexDbStore, { ObjectStoresEnum } from '@intershare/hooks.indexdb'
import localIpfsFileManager from '@intershare/hooks.local-ipfs-file-manager'
import { remoteIpfsFileManager } from '@intershare/hooks.remote-ipfs-file-manager'
import secureConnectManager from '@intershare/hooks.secure-connect-manager'
import {
  apiConstants,
  blobBufferToFile,
  reassembleBlob,
} from '@intershare/utils.general'
import { create } from 'zustand'
import { TRemoteIpfsFileIntegrity, Tconfig } from './common'

export const remoteIpfsFileIntegrity = create<TRemoteIpfsFileIntegrity>(
  (set): TRemoteIpfsFileIntegrity => ({
    filesChecked: [],
    intervalId: undefined,
    config: {
      enabled: false,
      interval: 60000,
    },

    setConfig: (newConfig: Partial<Tconfig>) => {
      set((prevState) => ({
        config: {
          ...prevState.config,
          ...newConfig,
        },
      }))
      // update interval
      const { intervalId, init } = remoteIpfsFileIntegrity.getState()
      if (newConfig.interval) {
        if (intervalId) clearInterval(intervalId)
        init()
      }
    },

    init: async () => {
      const {
        config: { interval },
        remoteCheckIntegrityFile,
        syncFileWithRemote,
      } = remoteIpfsFileIntegrity.getState()

      const intervalId = setInterval(async () => {
        const {
          config: { enabled },
          filesChecked,
        } = remoteIpfsFileIntegrity.getState()
        if (enabled) {
          const { urlFileList } = localIpfsFileManager.getState()
          for (const file of urlFileList) {
            if (filesChecked.includes(file.cid)) continue

            const isIntegrityOk = await remoteCheckIntegrityFile(file.cid)
            if (!isIntegrityOk) {
              await syncFileWithRemote(file.cid)
            }
          }
        }
      }, interval) as unknown as number

      set({ intervalId })
    },

    remoteCheckIntegrityFile: async (cid: string) => {
      const { remoteGetFileInfo } = remoteIpfsFileManager.getState()
      const {
        config: { api },
      } = secureConnectManager.getState()
      const fileInfo = await remoteGetFileInfo(cid)

      if (!fileInfo) {
        throw new Error(
          `No se pudo obtener información del archivo para CID: ${cid}`
        )
      }

      try {
        const response = await fetch(
          `${apiConstants.serverCheck}/${fileInfo.serverAlias}/${cid}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${api}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        set((prevState) => ({
          filesChecked: [...prevState.filesChecked, cid],
        }))
        const data = await response.json()
        return data as boolean
      } catch (error) {
        console.error('Error en remoteCheckIntegrityFile', error)
        throw error
      }
    },

    syncFileWithRemote: async (cid: string) => {
      const { remoteGetFileInfo } = remoteIpfsFileManager.getState()
      const {
        config: { api },
      } = secureConnectManager.getState()
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

        console.log('fileData', fileData)
        if (!fileData) {
          throw new Error(`Archivo no encontrado en IndexedDB para CID: ${cid}`)
        }

        const blob = reassembleBlob(fileData.buffers, fileData.type)
        const file = blobBufferToFile(cid, blob)

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(
          `${apiConstants.restoreIntegrity}/${serverAlias.trim()}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${api}`,
            },
            body: formData,
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
      } catch (err) {
        console.error(`Error en syncFileWithRemote para CID: ${cid}`, err)
        throw err
      }
    },
  })
)
