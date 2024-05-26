import { faker } from '@faker-js/faker'
import { indexDbStore } from '@galacfetch/indexdb'
import { remoteIpfsFileIntegrity } from '@galacfetch/remote-ipfs-file-integrity'
import { remoteIpfsFileManager } from '@galacfetch/remote-ipfs-file-manager'
import { act, renderHook } from '@testing-library/react-hooks'
import 'fake-indexeddb/auto'
import fetchMock from 'jest-fetch-mock'
import { TRemoteIpfsFileIntegrity } from '../src/common'
import { generateGetFileInfo } from './mocks/remoteGetFileInfo'

describe('remoteIpfsFileIntegrity', () => {
  fetchMock.enableMocks()
  global.URL.createObjectURL = jest.fn(
    (blob: any) => `blob:${blob.size}#t=${Date.now()}`
  )

  let remoteIpfsFileInt: TRemoteIpfsFileIntegrity

  const fileExample = generateGetFileInfo()
  remoteIpfsFileManager.getState().remoteGetFileInfo = jest
    .fn()
    .mockImplementation(() => fileExample)

  indexDbStore.getState().iDb = true as unknown as IDBDatabase

  beforeAll(async () => {
    globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val))
    const fakeData = faker.lorem.paragraphs({
      min: 50,
      max: 100,
    })
    indexDbStore.getState().getData = jest.fn().mockImplementation(() => {
      return {
        buffers: [fakeData],
        type: faker.system.mimeType(),
      }
    })

    const { result } = renderHook(() => remoteIpfsFileIntegrity())
    remoteIpfsFileInt = result.current
    await act(async () => {
      remoteIpfsFileInt.init()
    })

    // set the config for the test
    await act(async () => {
      remoteIpfsFileInt.setConfig({
        enabled: true,
        interval: 1000,
      })
    })
  })

  beforeEach(() => {
    fetchMock.doMock()
  })

  it('should check existant file in db but unexistent file in ipfs server, and return false', async () => {
    fetchMock.mockOnce(JSON.stringify(false))

    await act(async () => {
      const response = await remoteIpfsFileInt.remoteCheckIntegrityFile(
        fileExample.cid
      )
      expect(response).toBe(false)
    })
  }, 10000)

  it('should sync local file with remote server (mocked)', async () => {
    fetchMock.mockOnce(JSON.stringify(true))

    await act(async () => {
      const response = remoteIpfsFileInt.syncFileWithRemote(fileExample.cid)
      await expect(response).resolves.not.toThrow()
    })
  }, 10000)
})
