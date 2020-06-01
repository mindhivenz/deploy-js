import intoStream from 'into-stream'
import buffer from 'vinyl-buffer'
import source from 'vinyl-source-stream'

export default (
  filename: string,
  content: intoStream.Input | Promise<intoStream.Input>,
): NodeJS.ReadWriteStream =>
  intoStream(content).pipe(source(filename)).pipe(buffer())
