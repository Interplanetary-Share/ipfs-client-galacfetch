import { localIpfsFileManager } from '@intershare/hooks.local-ipfs-file-manager'
import { secureConnectManager } from '@intershare/hooks.secure-connect-manager'
import { apiConstants } from '@intershare/utils.general'
import { create } from 'zustand'
import { TRemoteIpfsFileManager } from './types/common'
import { IRemoteFileInfo } from './types/file'

export const remoteIpfsFileManager = create<TRemoteIpfsFileManager>(
  (set, get): TRemoteIpfsFileManager => ({
    config: {
      discoveryInterval: 60000,
    },
    fileDownloadPromises: {},
    init: (config) => {
      const { uploadBlobAndCreateUrl } = localIpfsFileManager.getState()
      const { config: configState } = remoteIpfsFileManager.getState()

      if (!config || !config.discoveryInterval) {
        config = {
          ...configState,
          ...config,
        }
      }

      setInterval(() => {
        const { wsConnected } = secureConnectManager.getState()
        wsConnected.forEach((ws) => {
          if (!ws.downloadListening) {
            const blobList = {} as any

            ws.on('download/socket', async ({ status, chunk, cid, type }) => {
              switch (status) {
                case 1:
                  blobList[cid] = []
                  break
                case 2:
                  const blob = new Blob([chunk])
                  blobList[cid].push(blob)
                  break
                case 3:
                  const finalBlobFile = new Blob(blobList[cid], { type })
                  delete blobList[cid] // Limpiar la memoria

                  const { fileDownloadPromises } = get()
                  if (fileDownloadPromises[cid]) {
                    try {
                      const url = await uploadBlobAndCreateUrl(
                        cid,
                        finalBlobFile
                      )

                      if (!url) {
                        throw new Error('Error al crear la URL del archivo.')
                      }

                      fileDownloadPromises[cid].resolve(url)
                    } catch (error) {
                      fileDownloadPromises[cid].reject(error)
                    } finally {
                      const updatedPromises = { ...fileDownloadPromises }
                      delete updatedPromises[cid]
                      set({ fileDownloadPromises: updatedPromises }) // Actualiza el estado
                    }
                  }

                  break
                default:
                  console.error('Estado de descarga no reconocido:', status)
                  // Manejar otros casos si es necesario
                  break
              }
            })

            ws.downloadListening = true
          }
        })
      }, config.discoveryInterval)
      set((prevState) => ({
        config: {
          ...prevState.config,
          ...config,
        },
      }))
    },
    remoteGetFileInfo: async (cid) => {
      const {
        config: { api },
      } = secureConnectManager.getState()

      try {
        const response = await fetch(`${apiConstants.fileApi}/${cid}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${api}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const fileInfo = await response.json()
        return fileInfo as IRemoteFileInfo | undefined
      } catch (err) {
        console.error(`Error fetching file info: ${err}`)
        // Puedes decidir cómo manejar los errores aquí,
        // como lanzar una excepción o devolver un valor por defecto
      }
    },

    remoteGetFilesInfo: async (isPublic = false, queryParams) => {
      const {
        config: { api },
      } = secureConnectManager.getState()

      // Crear los parámetros de búsqueda
      const searchParams = new URLSearchParams({
        ...(queryParams && {
          page: queryParams.page?.toString(),
          size: queryParams.size?.toString(),
          // Aquí necesitarás una lógica para convertir filter y sort en un formato de cadena adecuado
          // Por ejemplo, podrías convertir los objetos en cadenas JSON o alguna otra representación
          filter: queryParams.filter
            ? JSON.stringify(queryParams.filter)
            : undefined,
          sort: queryParams.sort ? JSON.stringify(queryParams.sort) : undefined,
        }),
        isPublic: isPublic.toString(),
      })

      const url = new URL(apiConstants.getAllFiles)
      url.search = searchParams.toString()

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${api}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const allFilesInfo = (await response.json()) || undefined
        return allFilesInfo as IRemoteFileInfo[] | undefined
      } catch (err) {
        console.error(`Error fetching files info: ${err}`)
        // Manejo de errores
      }
    },

    remoteGetFile: async (cid: string): Promise<string> => {
      const { fileDownloadPromises } = remoteIpfsFileManager.getState()
      const { wsConnected } = secureConnectManager.getState()

      if (!wsConnected || wsConnected.length === 0) {
        throw new Error('No servers found')
      }

      return new Promise((resolve, reject) => {
        // Actualizar el estado con la nueva promesa
        remoteIpfsFileManager.setState({
          fileDownloadPromises: {
            ...fileDownloadPromises,
            [cid]: { resolve, reject },
          },
        })

        try {
          wsConnected.forEach((ws) => {
            ws.emit('download', cid)
          })
        } catch (error) {
          // Eliminar la promesa del estado si hay un error
          const updatedPromises = { ...fileDownloadPromises }
          delete updatedPromises[cid]
          remoteIpfsFileManager.setState({
            fileDownloadPromises: updatedPromises,
          })

          reject(`Error al emitir la solicitud de descarga: ${error}`)
        }
      })
    },

    remoteUploadFile: async (file, fileProps) => {
      const {
        config: { api },
      } = secureConnectManager.getState()
      const { uploadBlobAndCreateUrl } = localIpfsFileManager.getState()

      const { name, description, extraProperties, isPublic } = fileProps

      const arrayBuffer = await file.arrayBuffer()
      const blob = new Blob([arrayBuffer], { type: file.type })

      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', name)
      formData.append('description', description)
      formData.append('isPublic', isPublic.toString())
      formData.append('extraProperties', JSON.stringify(extraProperties))

      try {
        const response = await fetch(apiConstants.fileUpload, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${api}`,
          },
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const {
          meta: { cid },
        } = data
        uploadBlobAndCreateUrl(cid, blob)
        return data
      } catch (error) {
        console.error('Error al subir el archivo:', error)
        throw error // Puedes decidir si quieres lanzar el error o manejarlo de otra manera
      }
    },

    remotegetFileExtraProps: async (cid) => {
      const {
        config: { api },
      } = secureConnectManager.getState()

      try {
        const response = await fetch(
          `${apiConstants.getExtraPropsFiles}/${cid}`,
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

        const data = await response.json()
        return data
      } catch (error) {
        console.error(
          'Error al obtener las propiedades adicionales del archivo:',
          error
        )
        throw error // Puedes decidir si quieres lanzar el error o manejarlo de otra manera
      }
    },

    remoteUpdateFile: async (cid, fileProps) => {
      const {
        config: { api },
      } = secureConnectManager.getState()

      try {
        const response = await fetch(`${apiConstants.fileApi}/${cid}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${api}`,
          },
          body: JSON.stringify(fileProps),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error('Error al actualizar el archivo:', error)
        throw error // Puedes decidir si quieres lanzar el error o manejarlo de otra manera
      }
    },
    remoteGetFileStats: async (cid, initDate, endDate) => {
      const {
        config: { api },
      } = secureConnectManager.getState()

      const queryParams = new URLSearchParams({
        initDate: initDate.toDateString(),
        endDate: endDate.toDateString(),
      })

      try {
        const response = await fetch(
          `${apiConstants.statsFile}/${cid}?
        ${queryParams.toString()}
        `,
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

        const data = await response.json()
        return data
      } catch (err) {
        console.error(`Error fetching file stats: ${err}`)
      }
    },
    remoteGetTokenStats: async (initDate, endDate) => {
      const {
        config: { api },
      } = secureConnectManager.getState()

      const queryParams = new URLSearchParams({
        initDate: initDate.toDateString(),
        endDate: endDate.toDateString(),
      })

      try {
        const response = await fetch(
          `${apiConstants.statsToken}?${queryParams.toString()}`,
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

        const data = await response.json()
        return data
      } catch (err) {
        console.error(`Error fetching token stats: ${err}`)
      }
    },

    // TODO: implement remoteDeleteFile
  })
)
