import log from 'fancy-log'
import PluginError from 'plugin-error'
import { Configuration, Stats } from 'webpack'

export default (config: Configuration) => (done: () => void) => {
  const webpack = require('webpack')
  try {
    webpack(config, (err: Error, stats: Stats) => {
      if (err) {
        throw new PluginError('webpack', err)
      }
      log(
        '[webpack]',
        stats.toString({
          // output options
        }),
      )
      done()
    })
  } catch (e) {
    throw new PluginError('webpack', e)
  }
}
