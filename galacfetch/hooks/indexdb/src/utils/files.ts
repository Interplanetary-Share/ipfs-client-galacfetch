export const calculateSizeFromObject = (obj: Object) => {
  return new Blob([JSON.stringify(obj)]).size
}
