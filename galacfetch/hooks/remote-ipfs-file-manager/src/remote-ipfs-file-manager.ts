import { localIpfsFileManager } from '@intershare/hooks.local-ipfs-file-manager'
import { apiConstants } from '@intershare/utils.general'
import { io } from 'socket.io-client'
import { create } from 'zustand'
import { TRemoteIpfsFileManager } from './types/common'
import { IRemoteFileInfo, TServerItem } from './types/file'

export const remoteIpfsFileManager = create<TRemoteIpfsFileManager>(
  (set, get): TRemoteIpfsFileManager => ({
    status: undefined,
    servers: [],
    api: null,
    fileDownloadPromises: {},
    init: async (api) => {
      const { connectToSocket } = remoteIpfsFileManager.getState()

      let getServers
      try {
        const response = await fetch(apiConstants.serverGetHost, {
          headers: {
            Authorization: `Bearer ${api}`,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        getServers = await response.json()
      } catch (err) {
        console.error('Error fetching servers:', err)
        throw new Error(String(err))
      }

      if (!getServers || getServers.length === 0) {
        throw new Error('No servers found')
      }

      const serversList = [] as TServerItem[]
      const socketPromises = getServers.map(async (server: string) => {
        const { socket } = await connectToSocket(server, api)
        serversList.push({
          host: server,
          ws: socket,
        })
        return socket
      })

      await Promise.all(socketPromises)
      set({ servers: serversList, api })
    },

    connectToSocket: (url, api) => {
      const { uploadBlobAndCreateUrl } = localIpfsFileManager.getState()

      return new Promise((resolve) => {
        const socket = io(url, {
          auth: {
            token: api,
          },
        })

        socket.on('connect', () => {
          resolve({
            socket,
          })
        })

        const blobList = {} as any

        socket.on('download/socket', async ({ status, chunk, cid, type }) => {
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
                  const url = await uploadBlobAndCreateUrl(cid, finalBlobFile)

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
              // Manejar otros casos si es necesario
              break
          }
        })
      })
    },

    remoteGetFileInfo: async (cid) => {
      const { api } = remoteIpfsFileManager.getState()

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

    // TODO: check this i dont like it
    remoteGetFilesInfo: async (isPublic = false, queryParams) => {
      const { api } = remoteIpfsFileManager.getState()

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
      const { servers, fileDownloadPromises } = remoteIpfsFileManager.getState()

      if (servers.length === 0) {
        throw new Error(
          'No hay servidores disponibles para procesar la solicitud.'
        )
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
          servers.forEach((server) => {
            const { ws } = server
            if (!ws) {
              throw new Error(
                'Conexión de websocket no encontrada en el servidor.'
              )
            }
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
      const { api } = remoteIpfsFileManager.getState()
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
      const { api } = remoteIpfsFileManager.getState()

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
      const { api } = remoteIpfsFileManager.getState()

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
  })
)
