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

export const reassembleBlob = (
  chunks: Blob[] | ArrayBufferLike[],
  mimeType: string
): Blob => {
  return new Blob(chunks, { type: mimeType })
}

export const blobBufferToFile = (cid: string, blob: Blob) => {
  return new File([blob], cid)
}

// WebRTC  -  UTILITIES
export const reassembleArrayBuffer = (chunks: any[]) => {
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0)
  const result = new Uint8Array(totalLength)

  let offset = 0
  chunks.forEach((chunk) => {
    result.set(new Uint8Array(chunk), offset)
    offset += chunk.byteLength
  })

  return result.buffer
}

// Función para convertir Blob en ArrayBuffer
export const blobToArrayBuffer = async (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(blob)
  })
}

// Función para dividir un ArrayBuffer en segmentos
export const chunkArrayBuffer = (
  arrayBuffer: ArrayBuffer,
  chunkSize: number
) => {
  const chunks = [] as ArrayBuffer[]
  for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
    const chunk = arrayBuffer.slice(i, i + chunkSize)
    chunks.push(chunk)
  }
  return chunks
}
