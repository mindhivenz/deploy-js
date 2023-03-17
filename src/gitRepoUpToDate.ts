import fs from 'fs'
import path from 'path'
import execFile from './execFile'

export default async (
  url: string,
  localDir: string,
  { shallow = false } = {},
) => {
  try {
    await fs.promises.access(path.join(localDir, '.git'), fs.constants.W_OK)
    await execFile('git', ['pull'], { cwd: localDir })
  } catch {
    const options: string[] = []
    if (shallow) {
      options.push('--depth=1')
    }
    await execFile('git', ['clone', ...options, url, localDir])
  }
}
