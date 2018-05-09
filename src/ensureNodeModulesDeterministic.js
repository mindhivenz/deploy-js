import { execFile } from 'child_process'
import ensureNoLinkedModules from './ensureNoLinkedModules'
import PluginError from 'plugin-error'


const pluginName = '@mindhive/deploy/ensureNodeModulesDeterministic'

export default async (path) => {

  const checkYarnIntegrity = () =>
    new Promise((resolve, reject) => {
      execFile('yarn', ['check', '--integrity', '--verify-tree'], { cwd: path }, (error, stdout, stderr) => {
        if (error) {
          reject(new PluginError(pluginName, `Yarn integrity check failed:\n${stderr}`))
        } else {
          resolve()
        }
      })
    })

  await Promise.all([
    ensureNoLinkedModules(path),
    checkYarnIntegrity(),
  ])
}
