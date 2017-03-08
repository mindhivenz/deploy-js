
export default (obj) => {
  const result = {}
  Object.keys(obj).forEach((k) => {
    if (! k.match(/secret/i) && ! k.match(/AccessKey/i)) {
      result[k] = obj[k]
    }
  })
  return result
}
