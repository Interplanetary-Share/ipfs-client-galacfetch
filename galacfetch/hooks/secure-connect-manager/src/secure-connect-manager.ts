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
    init: async ({ api, discoveryInterval }) => {
      const {
        intervalId: currentIntervalId,
        getServersUrlFromApi,
        establishConnections,
        discoverAndConnect,
      } = secureConnectManager.getState()

      if (typeof currentIntervalId === 'number') {
        clearInterval(currentIntervalId) // Limpia el intervalo
      }

      set({
        intervalId: null,
        wsConnected: [], // Actualiza el estado
        urlsDiscovered: [],
        config: {
          api,
          discoveryInterval,
        },
      })

      // Realiza una conexión de prueba
      try {
        const serverUrls = await getServersUrlFromApi(api)
        if (serverUrls.length > 0) {
          console.log('Initial server URLs found:', serverUrls)
          await establishConnections(serverUrls)
        }
      } catch (error) {
        console.error('Error during initial server discovery:', error)
        return false
      }

      // Establece el intervalo para verificaciones continuas
      const intervalId = setInterval(() => {
        discoverAndConnect()
      }, discoveryInterval)

      set({ intervalId }) // Actualiza el estado con el ID del intervalo
      return true
    },

    establishConnections: async (serverUrls) => {
      const {
        connectToSocket,
        config: { api },
      } = secureConnectManager.getState()
      for (const url of serverUrls) {
        try {
          const { socket } = await connectToSocket(url, api)
          set((prevState) => ({
            wsConnected: [...prevState.wsConnected, socket],
            urlsDiscovered: [...prevState.urlsDiscovered, url],
          }))
        } catch (error) {
          console.error(`Error connecting to server ${url}:`, error)
        }
      }
    },

    discoverAndConnect: async () => {
      const {
        establishConnections,
        urlsDiscovered,
        getServersUrlFromApi,
        config: { api },
      } = secureConnectManager.getState()
      try {
        const serverUrls = await getServersUrlFromApi(api)
        if (serverUrls.length > 0) {
          const missingUrls = serverUrls.filter(
            (url) => !urlsDiscovered.includes(url)
          )
          if (missingUrls.length > 0) {
            console.log('New servers found:', missingUrls)
            await establishConnections(missingUrls)
          }
        }
      } catch (error) {
        console.error('Error during server discovery:', error)
      }
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
