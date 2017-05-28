import fs from 'fs'


export default path => fs.readFileSync(path, 'utf8').trim()
