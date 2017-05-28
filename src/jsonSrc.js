import file from 'gulp-file'

import jsonPretty from './jsonPretty'


export default (filename, obj) =>
  file(filename, jsonPretty(obj), { src: true })
