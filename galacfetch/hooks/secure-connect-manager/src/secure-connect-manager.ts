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

    init: ({ api, discoveryInterval }) => {
      setInterval(async () => {
        const { getServersUrlFromApi, urlsDiscovered } =
          secureConnectManager.getState()
        const serverUrls = await getServersUrlFromApi(api)

        if (serverUrls.length === 0) {
          throw new Error('No servers found')
        }

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
            }))
          }
        }
      }, discoveryInterval)

      set((prevState) => ({
        config: {
          ...prevState.config,
          api,
          discoveryInterval,
        },
      }))
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
        throw new Error('No servers found')
      }

      return getServers
    },
  })
)
