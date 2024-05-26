import { Socket } from 'socket.io-client'

type TConfig = {
  api: string
  discoveryInterval: number
}

// Check if necessary export
export interface ExtendedSocket extends Socket {
  downloadListening?: boolean
  webRTCListening?: boolean
}

export type TSecureConnectManager = {
  wsConnected: ExtendedSocket[]
  urlsDiscovered: string[]
  config: TConfig
  intervalId?: null | number | NodeJS.Timeout
  init: (config: TConfig) => Promise<boolean>
  connectToSocket: (url: string, api: string) => Promise<ExtendedSocket> // TODO: Definir un tipo más específico
  getServersUrlFromApi: (api: string) => Promise<string[]>

  // Auxiliar functions
  establishConnections: (serverUrls: string[]) => Promise<void>
  discoverAndConnect: () => Promise<void>
}
