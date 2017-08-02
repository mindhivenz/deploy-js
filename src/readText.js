import fs from 'fs'
import gutil from 'gulp-util'


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
      throw new gutil.PluginError(
        pluginName,
        `First run task ${gutil.colors.cyan(taskNameToCreate)} to create ${gutil.colors.yellow(shortPath)}`,
        { showProperties: false },
      )
    }
    throw e
  }
}
