import gutil from 'gulp-util'


export default config =>
  (done) => {
    const webpack = require('webpack')  // eslint-disable-line
    try {
      webpack(
        config,
        (err, stats) => {
          if (err) {
            throw new gutil.PluginError('webpack', err)
          }
          gutil.log('[webpack]', stats.toString({
            // output options
          }))
          done()
        },
      )
    } catch (e) {
      throw new gutil.PluginError('webpack', e)
    }
  }
