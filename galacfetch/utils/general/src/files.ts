export const calculateSizeFromObject = (obj: Object) => {
  return new Blob([JSON.stringify(obj)]).size
}

export const bytesToGB = (bytes: number) => {
  return bytes / 1024 / 1024 / 1024
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

export const fileToBlobUrl = (fileOrBlob: File | Blob) => {
  return URL.createObjectURL(fileOrBlob)
}

export const reassembleBlob = (chunks: Blob[], mimeType: string): Blob => {
  return new Blob(chunks, { type: mimeType })
}

export const blobBufferToFile = (cid: string, blob: Blob) => {
  return new File([blob], cid)
}
