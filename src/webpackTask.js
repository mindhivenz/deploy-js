import PluginError from 'plugin-error'
import log from 'fancy-log'


export default config =>
  (done) => {
    const webpack = require('webpack')  // eslint-disable-line
    try {
      webpack(
        config,
        (err, stats) => {
          if (err) {
            throw new PluginError('webpack', err)
          }
          log('[webpack]', stats.toString({
            // output options
          }))
          done()
        },
      )
    } catch (e) {
      throw new PluginError('webpack', e)
    }
  }
