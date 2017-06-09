import fs from 'fs'
import gutil from 'gulp-util'


export default (path, pluginName = '@mindhive/deploy/readJson') => {
  try {
    return JSON.parse(fs.readFileSync(path))
  } catch (e) {
    throw new gutil.PluginError(pluginName, e)
  }
}
