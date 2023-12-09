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

export const chunkBlobAsync = async (
  blob: Blob,
  chunkSize: number = defaultChunkSize
): Promise<Blob[]> => {
  const chunks: Blob[] = []
  let start = 0

  while (start < blob.size) {
    const end = Math.min(start + chunkSize, blob.size)
    const chunk = blob.slice(start, end)
    chunks.push(chunk)
    start = end
  }

  return chunks
}

export const reassembleBlob = (chunks: Blob[], mimeType: string): Blob => {
  return new Blob(chunks, { type: mimeType })
}

export const bytesToGB = (bytes: number) => {
  return bytes / 1024 / 1024 / 1024
}
