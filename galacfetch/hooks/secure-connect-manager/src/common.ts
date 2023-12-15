type TConfig = {
  api: string
  discoveryInterval: number
}

export type TSecureConnectManager = {
  wsConnected: any[] // TODO: add type of ws.
  urlsDiscovered: string[]
  config: TConfig
  init: (config: TConfig) => void
  connectToSocket: (url: string, api: string) => Promise<any> // TODO: add type.
  getServersUrlFromApi: (api: string) => Promise<string[]>
}
