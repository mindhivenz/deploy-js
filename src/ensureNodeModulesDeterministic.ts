import { execFile } from 'child_process'
import PluginError from 'plugin-error'
import ensureNoLinkedModules from './ensureNoLinkedModules'

const pluginName = '@mindhivenz/deploy/ensureNodeModulesDeterministic'

export default async (path: string) => {
  const checkYarnIntegrity = () =>
    new Promise((resolve, reject) => {
      execFile(
        'yarn',
        ['check', '--integrity', '--verify-tree'],
        { cwd: path },
        (error, stdout, stderr) => {
          if (error) {
            reject(
              new PluginError(
                pluginName,
                `Yarn integrity check failed:\n${stderr}`,
              ),
            )
          } else {
            resolve(undefined)
          }
        },
      )
    })

  await Promise.all([ensureNoLinkedModules(path), checkYarnIntegrity()])
}
