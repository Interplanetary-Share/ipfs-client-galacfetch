import { apiConstants } from '@intershare/utils.general'
import { io } from 'socket.io-client'
import { create } from 'zustand'
import { TSecureConnectManager } from './common'

export const secureConnectManager = create<TSecureConnectManager>(
  (set): TSecureConnectManager => ({
    wsConnected: [],
    urlsDiscovered: [],
    config: {
      api: '',
      discoveryInterval: 60000,
    },
    intervalId: null,

    init: ({ api, discoveryInterval }) => {
      const { intervalId: currentIntervalId } = secureConnectManager.getState()

      if (typeof currentIntervalId === 'number') {
        clearInterval(currentIntervalId) // Limpia el intervalo
        set({
          intervalId: null,
          wsConnected: [], // Actualiza el estado
          urlsDiscovered: [],
        }) // Actualiza el estado
      }

      // Agrega un estado para manejar el estado del intervalo
      let intervalId = null as null | number | NodeJS.Timeout

      try {
        // Guarda una referencia al método 'set' actual

        intervalId = setInterval(async () => {
          const { getServersUrlFromApi, urlsDiscovered } =
            secureConnectManager.getState()

          try {
            const serverUrls = await getServersUrlFromApi(api).catch((err) => {
              console.error('Error fetching servers:', err)

              if (typeof intervalId === 'number') {
                clearInterval(intervalId) // Limpia el intervalo
              }
              set({ intervalId: null }) // Actualiza el estado
              throw new Error(String(err))
            })

            if (serverUrls.length === 0) {
              console.warn('No servers found 1')
            } else {
              const urlsToConnect = serverUrls.filter(
                (url) => !urlsDiscovered.includes(url)
              )

              if (urlsToConnect.length > 0) {
                console.log('New servers found:', serverUrls)
                const { connectToSocket } = secureConnectManager.getState()

                for (const urlToConnect of urlsToConnect) {
                  const { socket } = await connectToSocket(urlToConnect, api)
                  set((prevState) => ({
                    wsConnected: [...prevState.wsConnected, socket],
                    urlsDiscovered: [...prevState.urlsDiscovered, urlToConnect],
                  }))
                }
              }
            }
          } catch (error) {
            console.error('Error during server discovery:', error)
          }
        }, discoveryInterval)

        console.log('Interval established successfully')
      } catch (error) {
        set({ intervalId: null }) // Actualiza el estado
        console.error('Error initializing the interval:', error)
      }

      set((prevState) => ({
        config: {
          ...prevState.config,
          api,
          discoveryInterval,
        },
        intervalId, // Almacena el ID del intervalo en el estado
      }))

      return intervalId !== null
    },

    connectToSocket: (url, api) => {
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
      })
    },

    getServersUrlFromApi: async (api: string) => {
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
        throw new Error('No servers found 2')
      }

      return getServers
    },
  })
)
