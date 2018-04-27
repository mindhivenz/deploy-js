import { Glob } from 'glob'
import PluginError from 'plugin-error'


const pluginName = '@mindhive/deploy/ensureNoLinkedModules'

export default path =>
  new Promise((resolve, reject) => {
    // Trailing slash means only match directories
    // because we want to ignore other symlinks like those produced by file: packages
    const glob = new Glob(`${path}/node_modules/{*,@*/*}/`, { read: false })
    glob
      .on('end', (matches) => {
        // But then need to remove the trailing slash from the match to find it in symlinks
        const linked = matches
          .filter(p => p.endsWith('/') && glob.symlinks[p.slice(0, -1)])
        if (linked.length) {
          reject(new PluginError(pluginName, `You have linked node_modules:\n${linked.join('\n')}`)
          )
        } else {
          resolve()
        }
      })
      .on('error', e => reject(new PluginError(pluginName, e)))
  })
