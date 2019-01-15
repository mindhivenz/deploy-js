import intoStream from 'into-stream'
import buffer from 'vinyl-buffer'
import source from 'vinyl-source-stream'

import jsonPretty from './jsonPretty'

export default (filename: string, obj: object) =>
  intoStream(jsonPretty(obj))
    .pipe(source(filename))
    .pipe(buffer())
