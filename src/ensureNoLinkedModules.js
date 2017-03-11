import glob from 'glob'
import gutil from 'gulp-util'


const pluginName = 'ensureNoLinkedModules'

export default path =>
  new Promise((resolve, reject) => {
    const result = new glob.Glob(`${path}/node_modules/**`, { read: false })
    result
      .on('end', () => {
        const linked = Object.entries(result.symlinks)
          .filter(([, v]) => v)
          .map(([k]) => k)
        if (linked.length) {
          reject(new gutil.PluginError(pluginName, `You have linked node_modules:\n${linked.join('\n')}`)
          )
        } else {
          resolve()
        }
      })
      .on('error', e => reject(new gutil.PluginError(pluginName, e)))
  })
