import { UrlFileList } from '../types/file';

export const isFilePreloaded = (arr2Check: UrlFileList[], cid: string) => {
  if (!arr2Check || !arr2Check.length) return false;

  return arr2Check.some(
    (urlFile: { cid: string; url: string }) => urlFile.cid === cid
  );
};

export const fileToBlobUrl = (fileOrBlob: File | Blob) => {
  return URL.createObjectURL(fileOrBlob);
};

export const blobBufferToFile = (blob: Blob, cid: string) => {
  return new File([blob], cid);
};

export const bytes2MB = (bytes = 0) => {
  return (bytes / 1024 / 1024).toFixed(2);
};

export const byteNormalize = (bytes = 0) => {
  if (bytes === 0) return '0 Byte';
  const k = 1024;
  const dm = 2 < 0 ? 0 : 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const loadScript = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script') as any;
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;

    document.body.appendChild(script);
  });
};

const defaultChunkSize = 1024 * 1024 * 6; // 6MB

export const chunkBlobToBuffer = async (
  blob: Blob,
  chunkSize = defaultChunkSize
) => {
  const chunks: ArrayBuffer[] = [];
  const totalChunks = Math.ceil(blob.size / chunkSize);
  let currentChunk = 0;

  while (currentChunk < totalChunks) {
    const start = currentChunk * chunkSize;
    const end = start + chunkSize >= blob.size ? blob.size : start + chunkSize;
    const chunk = await blob.slice(start, end).arrayBuffer();
    chunks.push(chunk);
    currentChunk++;
  }

  return chunks;
};
