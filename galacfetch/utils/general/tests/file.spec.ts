import { faker } from '@faker-js/faker'

import {
  bytesToGB,
  chunkBlobAsync,
  fileToBlobUrl,
  reassembleBlob,
} from '../src/files'

describe('utils file', () => {
  globalThis.URL.createObjectURL = jest.fn(
    (blob: any) => `blob:${blob.size}#t=${Date.now()}`
  )

  it('chunkBlobAsync => should split blob in parts with given size', async () => {
    const fakeData = faker.lorem.paragraphs({
      min: 50,
      max: 100,
    })
    console.log(fakeData)
    const testBlob = new Blob([fakeData], { type: 'text/plain' })
    console.log(testBlob)
    const chunksSize = 2048 // 2KB
    const chunks = await chunkBlobAsync(testBlob, chunksSize)
    expect(chunks.length).toBeGreaterThan(0)
    expect(chunks[0].size).toBeLessThanOrEqual(chunksSize)
    console.log(chunks)
    console.log(chunks[0].size)
    console.log(chunks[chunks.length - 1].size)
  })

  it('fileToBlobUrl =>  should return a blob url from blob file', async () => {
    const fakeData = faker.lorem.paragraphs({
      min: 10,
      max: 50,
    })
    const testBlob = new Blob([fakeData], { type: 'text/plain' })
    const response = fileToBlobUrl(testBlob)
    console.log(response)
    expect(response).toContain('blob:')
  })

  it('reassembleBlob => should  reassemble blob from chunks', async () => {
    const fakeData = faker.lorem.paragraphs({ min: 10, max: 50 })
    const testBlob = new Blob([fakeData], { type: 'text/plain' })
    const chunksSize = 2048 // 2KB
    const chunks = await chunkBlobAsync(testBlob, chunksSize)
    const response = reassembleBlob(chunks, 'text/plain')
    console.log(response)
    expect(response).toBeDefined()
    expect(response.size).toBe(testBlob.size)
    expect(response.type).toBe(testBlob.type)
    expect(response).toBeInstanceOf(Blob)
  })

  it('bytesToGB => should  return the correct value in GB', async () => {
    // Prueba con 1 GB
    const bytesInOneGB = 1024 * 1024 * 1024 // 1 GB en bytes
    expect(bytesToGB(bytesInOneGB)).toBe(1)

    // Prueba con 512 MB
    const bytesIn512MB = 512 * 1024 * 1024 // 512 MB en bytes
    expect(bytesToGB(bytesIn512MB)).toBe(0.5)

    // Prueba con 0 bytes
    expect(bytesToGB(0)).toBe(0)
  })
})
