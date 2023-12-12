import { TindexDbStore, indexDbStore } from '@intershare/hooks.indexdb'
import { localIpfsFileManager } from '@intershare/hooks.local-ipfs-file-manager'
import { act, renderHook } from '@testing-library/react-hooks'
import 'fake-indexeddb/auto'
import { TLocalIpfsFileManagerStore } from '../src/types/common'

describe('localIpfsFileManager', () => {
  let localIpfsFM: TLocalIpfsFileManagerStore
  let dbStore: TindexDbStore

  beforeAll(async () => {
    global.structuredClone = (val) => JSON.parse(JSON.stringify(val))
    global.URL.createObjectURL = jest.fn(
      (blob: any) => `blob:${blob.size}#t=${Date.now()}`
    )

    const { result } = renderHook(() => localIpfsFileManager())
    localIpfsFM = result.current

    const { result: result2, waitForNextUpdate: waitForNextUpdate2 } =
      renderHook(() => indexDbStore())
    dbStore = result2.current
    await act(async () => {
      dbStore.initIndexedDb('test')
      await waitForNextUpdate2()
    })
  })

  it('should save data to the store', async () => {
    const cid = 'QmVhZGZpbGU='
    const blob = new Blob(['hello world'], { type: 'text/plain' })
    await act(async () => {
      await expect(
        localIpfsFM.uploadBlobAndCreateUrl(cid, blob)
      ).resolves.not.toThrow()
    })
  })

  it('should save and retrieve a file URL from the store', async () => {
    const cid = 'QmVhZGZpbGU='
    const blob = new Blob(['hello world'], { type: 'text/plain' })
    await act(async () => {
      await expect(
        localIpfsFM.uploadBlobAndCreateUrl(cid, blob)
      ).resolves.not.toThrow()
    })

    await act(async () => {
      const url = await localIpfsFM.getLocalFileUrl(cid)
      expect(url).toBeDefined() // Verifica que la URL esté definida
      expect(url).toContain('blob:') // Verifica que la URL sea una URL de blob
    })
  })

  it('should save, retrieve, and remove a file from the store', async () => {
    const cid = 'QmVhZGZpbGU='
    const blob = new Blob(['hello world'], { type: 'text/plain' })

    // Guardar el archivo
    await act(async () => {
      await expect(
        localIpfsFM.uploadBlobAndCreateUrl(cid, blob)
      ).resolves.not.toThrow()
    })

    // Recuperar la URL del archivo
    let url
    await act(async () => {
      url = await localIpfsFM.getLocalFileUrl(cid)
      expect(url).toBeDefined()
      expect(url).toContain('blob:')
    })

    // Eliminar el archivo
    await act(async () => {
      await expect(localIpfsFM.removeFileByCid(cid)).resolves.not.toThrow()
    })

    // Verificar que el archivo ya no existe
    await act(async () => {
      const deletedUrl = await localIpfsFM.getLocalFileUrl(cid)
      expect(deletedUrl).toBeUndefined()
    })
  })
})
