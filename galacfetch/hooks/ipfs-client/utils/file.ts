import { IFileUrlInfo } from '../types/file'

export const isFilePreloaded = (arr2Check: IFileUrlInfo[], cid: string) => {
  if (!arr2Check || !arr2Check.length) return false

  return arr2Check.some(
    (urlFile: { cid: string; url: string }) => urlFile.cid === cid
  )
}

export const fileToBlobUrl = (fileOrBlob: File | Blob) => {
  return URL.createObjectURL(fileOrBlob)
}

export const blobBufferToFile = (blob: Blob, cid: string) => {
  return new File([blob], cid)
}

const defaultChunkSize = 1024 * 1024 * 6 // 6MB

export const chunkBlobToBuffer = async (
  blob: Blob,
  chunkSize = defaultChunkSize
) => {
  const chunks: ArrayBuffer[] = []
  const totalChunks = Math.ceil(blob.size / chunkSize)
  let currentChunk = 0

  while (currentChunk < totalChunks) {
    const start = currentChunk * chunkSize
    const end = start + chunkSize >= blob.size ? blob.size : start + chunkSize
    const chunk = await blob.slice(start, end).arrayBuffer()
    chunks.push(chunk)
    currentChunk++
  }

  return chunks
}
