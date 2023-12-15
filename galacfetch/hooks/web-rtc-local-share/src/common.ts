type Tconfig = {
  discoveryInterval: number
}

export type TWebRTCLocalShare = {
  config: Tconfig
  init: (config: Tconfig) => void
}
