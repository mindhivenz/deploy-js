import fs from 'fs'
import PluginError from 'plugin-error'
import { highlight, task } from './internal/colors'

export interface IOptions {
  taskNameToCreate?: string
  pluginName?: string
}

export default (
  path: string,
  { taskNameToCreate, pluginName = '@mindhive/deploy' }: IOptions = {},
) => {
  try {
    return fs.readFileSync(path, 'utf8').trim()
  } catch (e) {
    if (taskNameToCreate && e.code === 'ENOENT') {
      const shortPath = path.startsWith(process.cwd())
        ? path.substring(process.cwd().length + 1)
        : path
      throw new PluginError(
        pluginName,
        `First run task ${task(taskNameToCreate)} to create ${highlight(
          shortPath,
        )}`,
        { showProperties: false },
      )
    }
    throw e
  }
}
