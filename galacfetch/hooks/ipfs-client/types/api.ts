// export const baseApi = 'http://localhost:3010';
export const baseApi = 'https://api.galacfetch.com/'

// Server
export const serverApi = baseApi + '/server'
export const serverGetAlias = serverApi + '/get/alias'
export const serverGetHost = serverApi + '/get/host'
export const serverCheck = serverApi + '/check'

// File
export const fileApi = baseApi + '/file'
export const fileUpload = fileApi + '/upload'
export const getAllFiles = fileApi + '/files'
export const getExtraPropsFiles = fileApi + '/extra'
export const restoreIntegrity = fileApi + '/restore/integrity'
