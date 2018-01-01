import glob from 'glob'
import PluginError from 'plugin-error'


const pluginName = '@mindhive/deploy/ensureNoLinkedModules'

export default path =>
  new Promise((resolve, reject) => {
    const result = new glob.Glob(`${path}/node_modules/**`, { read: false })
    result
      .on('end', () => {
        const linked = Object.entries(result.symlinks)
          .filter(([, v]) => v)
          .map(([k]) => k)
        if (linked.length) {
          reject(new PluginError(pluginName, `You have linked node_modules:\n${linked.join('\n')}`)
          )
        } else {
          resolve()
        }
      })
      .on('error', e => reject(new PluginError(pluginName, e)))
  })
