import fs from 'fs'
import PluginError from 'plugin-error'
import colors from 'ansi-colors'


export default (
  path,
  {
    taskNameToCreate,
    pluginName = '@mindhive/deploy',
  } = {}
) => {
  try {
    return fs.readFileSync(path, 'utf8').trim()
  } catch (e) {
    if (taskNameToCreate && e.code === 'ENOENT') {
      const shortPath = path.startsWith(process.cwd()) ? path.substring(process.cwd().length + 1) : path
      throw new PluginError(
        pluginName,
        `First run task ${colors.cyan(taskNameToCreate)} to create ${colors.yellow(shortPath)}`,
        { showProperties: false },
      )
    }
    throw e
  }
}
