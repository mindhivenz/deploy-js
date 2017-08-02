import readText from './readText'


export default (path, options) =>
  JSON.parse(readText(path, options))
