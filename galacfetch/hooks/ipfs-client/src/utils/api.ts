import { indexDbStore } from '@intershare/hooks.indexdb'
import { useRemoteIpfsClient } from '../useRemoteIpfsClient'
import localIpfsFileManager from '../../../local-ipfs-file-manager'

export const wrapperProtect = async (set: Function, fn: Function) => {
  set({ status: 'loading' })
  try {
    await waitForApiReady()
    const response = await fn()
    set({ status: 'idle' })
    return response
  } catch (error) {
    set({
      status: {
        error: 'error',
        message: error,
      },
    })
    console.error('error', error)
    return error
  }
}

const waitForApiReady = (maxRetries = 15) => {
  let retries = 0
  let delay = 100 // Tiempo inicial de espera

  return new Promise((resolve, reject) => {
    const checkApiStatus = () => {
      const { api } = useRemoteIpfsClient.getState()
      const { iDb } = indexDbStore.getState()
      if (api && iDb) {
        resolve(true)
      } else if (retries < maxRetries) {
        if (!api) {
          console.warn(
            "🚫 Action halted! The API token isn't ready yet. Please ensure the token is valid 🛠️"
          )
        }
        if (!iDb) {
          console.warn(
            "🚫 Action halted! The IndexedDB isn't ready yet. Please ensure the initialization method has been executed properly. 🛠️"
          )
        }
        retries++
        delay += 1000 // Incrementa el tiempo de espera en 1 segundo
        setTimeout(checkApiStatus, delay)
      } else {
        reject(new Error('Max retries reached. API token is not ready.'))
      }
    }
    checkApiStatus()
  })
}

export const waitForFileReady = (cid: string, maxRetries = 15) => {
  if (!cid) console.error('no cid provided')

  let retries = 0
  let delay = 100 // Tiempo inicial de espera

  return new Promise((resolve, reject) => {
    const checkFileStatus = () => {
      const { findPreloadFile } = localIpfsFileManager.getState()
      if (findPreloadFile(cid)) {
        resolve(true)
      } else if (retries < maxRetries) {
        // TODO: add somithing like progress or something like that...
        console.info('waiting for file to be ready...')

        retries++
        delay += 1000 // Incrementa el tiempo de espera en 1 segundo
        setTimeout(checkFileStatus, delay)
      } else {
        reject(new Error('Max retries reached. File is not ready.'))
      }
    }
    checkFileStatus()
  })
}
