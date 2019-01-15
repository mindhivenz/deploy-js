import { lstat, readdir } from 'fs'
import { join } from 'path'
import PluginError from 'plugin-error'
import { promisify } from 'util'

// REVISIT: linked modules OK if linked from same Git tree
// REVISIT: should check that file: linked packages are in the same Git tree

const pluginName = '@mindhive/deploy/ensureNoLinkedModules'

const readdirAsync = promisify(readdir)
const lstatAsync = promisify(lstat)

const checkDir = async (dirPath: string) => {
  const filenames = await readdirAsync(dirPath)
  await Promise.all([
    ...filenames.map(async f => {
      const filePath = join(dirPath, f)
      const stat = await lstatAsync(filePath)
      if (stat.isSymbolicLink()) {
        throw new PluginError(
          pluginName,
          `You have linked node_module: ${filePath}`,
        )
      }
    }),
    ...filenames
      .filter(f => f.startsWith('@'))
      .map(f => checkDir(join(dirPath, f))),
  ])
}

export default async (path: string) => {
  await checkDir(join(path, 'node_modules'))
}
