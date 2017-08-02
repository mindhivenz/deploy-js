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
    fs.readFileSync(path, 'utf8').trim()
  } catch (e) {
    if (taskNameToCreate && e.code === 'ENOENT') {
      const shortPath = path.startsWith(process.cwd()) ? path.substring(process.cwd().length) : path
      throw new gutil.PluginError(pluginName, `First run task ${taskNameToCreate} to create ${shortPath}`)
    }
    throw e
  }
}
