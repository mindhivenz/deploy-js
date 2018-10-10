import source from 'vinyl-source-stream'
import intoStream from 'into-stream'
import buffer from 'vinyl-buffer'

import jsonPretty from './jsonPretty'

export default (filename, obj) =>
  intoStream(jsonPretty(obj))
    .pipe(source(filename))
    .pipe(buffer())
