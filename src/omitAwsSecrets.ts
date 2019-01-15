export default (obj: Record<string, string>) => {
  const result: Record<string, string> = {}
  Object.keys(obj).forEach(k => {
    if (!k.match(/secret/i) && !k.match(/AccessKey/i)) {
      result[k] = obj[k]
    }
  })
  return result
}
