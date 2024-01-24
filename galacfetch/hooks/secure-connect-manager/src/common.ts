type TConfig = {
  api: string
  discoveryInterval: number
}

export type TSecureConnectManager = {
  wsConnected: any[] // TODO: Definir el tipo específico de la conexión WebSocket
  urlsDiscovered: string[]
  config: TConfig
  intervalId?: null | number | NodeJS.Timeout // Nuevo campo para almacenar el ID del intervalo
  init: (config: TConfig) => boolean // Actualizado para reflejar el nuevo valor de retorno
  connectToSocket: (url: string, api: string) => Promise<any> // TODO: Definir un tipo más específico
  getServersUrlFromApi: (api: string) => Promise<string[]>
}
