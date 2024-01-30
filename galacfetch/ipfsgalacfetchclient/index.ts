import { ipfsGalactFetchClient } from './src/ipfsGalactFetchClient'

export { ipfsGalactFetchClient }
export * as utils from '@intershare/utils.general'

import * as indexdb from '@intershare/hooks.indexdb'
import * as localIpfsFileManager from '@intershare/hooks.local-ipfs-file-manager'
import * as remoteIpfsFileManager from '@intershare/hooks.remote-ipfs-file-manager'
import * as remoteIpfsFileIntegrity from '@intershare/hooks.remote-ipfs-file-integrity'
import * as secureConnectManager from '@intershare/hooks.secure-connect-manager'

export const hooks = {
  ...indexdb,
  ...localIpfsFileManager,
  ...remoteIpfsFileManager,
  ...remoteIpfsFileIntegrity,
  ...secureConnectManager,
}
