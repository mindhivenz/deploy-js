import colors from 'ansi-colors'
import log from 'fancy-log'
import execFile from './execFile'

interface IOptions {
  host: string
  meteorRootPath: string
  galaxyRegion: string
  meteorSettingsPath: string
}

export default async ({
  host,
  meteorRootPath,
  galaxyRegion,
  meteorSettingsPath,
}: IOptions) => {
  const galaxyManagementServer = `${galaxyRegion}.galaxy.meteor.com`
  await execFile('meteor', ['whoami']) // So the next command won't sit there asking for user to login
  await execFile('meteor', ['deploy', host, '--settings', meteorSettingsPath], {
    cwd: meteorRootPath,
    env: {
      ...process.env,
      DEPLOY_HOSTNAME: galaxyManagementServer,
    },
  })
  log(
    `Check status of Mete${colors.red('o')}r deployment at`,
    colors.blue(`https://${galaxyManagementServer}/app/${host}/logs`),
  )
}
