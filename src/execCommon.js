import log from 'fancy-log'
import PluginError from 'plugin-error'
import path from 'path'
import colors from 'ansi-colors'
import findUp from 'find-up'

export const handleExecError = (pluginName, command, e) => {
  log(
    colors.red('Error'),
    colors.blue(command),
  )
  if (e.stderr) {
    log(e.stderr)
  } else if (e.stdout) {
    log(e.stdout)
  }
  return new PluginError(pluginName, e.message)
}

export const defaultOptions = async (options = {}) => {
  if (! options.cwd) {
    options.cwd = process.cwd()
  }
  if (! options.maxBuffer) {
    options.maxBuffer = 10 * 1024 * 1024
  }
  const nodeModules = await findUp('node_modules', { cwd: options.cwd })
  if (nodeModules) {
    const binDir = path.join(nodeModules, '.bin')
    if (! options.env) {
      options.env = { ...process.env }   // copy, don't modify the original
    }
    if (! options.env.PATH) {
      options.env.PATH = binDir
    } else {
      options.env.PATH = `${binDir}${path.delimiter}${options.env.PATH}`
    }
  }
  return options
}
