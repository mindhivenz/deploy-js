import readText, { IOptions } from './readText'

export default (path: string, options?: IOptions) =>
  JSON.parse(readText(path, options))
