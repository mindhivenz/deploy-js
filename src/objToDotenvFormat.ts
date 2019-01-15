export default (obj: Record<string, any>) =>
  Object.entries(obj).reduce((result, [k, v]) => `${result}${k}=${v}\n`, '')
