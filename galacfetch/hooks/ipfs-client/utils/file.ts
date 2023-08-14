import { UrlFileList } from '../types/file';

export const isFilePreloaded = (arr2Check: UrlFileList[], cid: string) => {
  if (!arr2Check || !arr2Check.length) return false;

  return arr2Check.some(
    (urlFile: { cid: string; url: string }) => urlFile.cid === cid
  );
};

export const fileToBlobUrl = (file: File) => {
  return URL.createObjectURL(file);
};
