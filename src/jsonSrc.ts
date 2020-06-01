import buildSrc from './buildSrc'
import jsonPretty from './jsonPretty'

export default (
  filename: string,
  obj: object | Promise<object>,
): NodeJS.ReadWriteStream => {
  const resolvePretty = async (): Promise<string> => jsonPretty(await obj)
  return buildSrc(filename, resolvePretty())
}
