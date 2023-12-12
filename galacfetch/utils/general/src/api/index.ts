export const baseApi = 'https://api.galacfetch.com' // 'http://localhost:3010';

// Server
export const serverApi = `${baseApi}/server`
export const serverGetAlias = `${serverApi}/get/alias`
export const serverGetHost = `${serverApi}/get/host`
export const serverCheck = `${serverApi}/check`

// File
export const fileApi = `${baseApi}/file` // TODO: this is in local-ipfs-file-manager
export const fileUpload = `${fileApi}/upload`
export const getAllFiles = `${fileApi}/files`
export const getExtraPropsFiles = `${fileApi}/extra`
export const restoreIntegrity = `${fileApi}/restore/integrity` // TODO: this is in local-ipfs-file-manager
