import { IFileUrlInfo } from '@intershare/hooks.local-ipfs-file-manager'

export type Tconfig = {
  enabled: boolean
  interval: number
}

export type TRemoteIpfsFileIntegrity = {
  filesChecked: IFileUrlInfo[]
  intervalId: number | undefined
  config: Tconfig
  setConfig: (newConfig: Partial<Tconfig>) => void

  init: () => Promise<void>
  syncFileWithRemote: (cid: string) => Promise<void>
  remoteCheckIntegrityFile: (cid: string) => Promise<boolean>
}
