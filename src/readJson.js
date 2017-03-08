import fs from 'fs'


export default path =>
  JSON.parse(fs.readFileSync(path))
