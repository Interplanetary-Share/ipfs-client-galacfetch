type TConfig = {
  api: string
  discoveryInterval: number
}

export type TSecureConnectManager = {
  wsConnected: any[] // TODO: Definir el tipo específico de la conexión WebSocket
  urlsDiscovered: string[]
  config: TConfig
  intervalId?: null | number | NodeJS.Timeout // Nuevo campo para almacenar el ID del intervalo
  init: (config: TConfig) => Promise<boolean>
  connectToSocket: (url: string, api: string) => Promise<any> // TODO: Definir un tipo más específico
  getServersUrlFromApi: (api: string) => Promise<string[]>

  // Auxiliar functions
  establishConnections: (serverUrls: string[]) => Promise<void>
  discoverAndConnect: () => Promise<void>
}
