import log from 'fancy-log'
import colors from 'ansi-colors'
import execFile from './execFile'


export default async ({
  host,
  meteorRootPath,
  galaxyRegion,
  meteorSettingsPath,
}) => {
  const galaxyManagementServer = `${galaxyRegion}.galaxy.meteor.com`
  await execFile('meteor', ['whoami'])  // So the next command won't sit there asking for user to login
  await execFile('meteor', ['deploy', host, '--settings', meteorSettingsPath], {
    env: {
      ...process.env,
      DEPLOY_HOSTNAME: galaxyManagementServer,
    },
    cwd: meteorRootPath,
  })
  log(
    `Check status of Mete${colors.red('o')}r deployment at`,
    colors.blue(`https://${galaxyManagementServer}/app/${host}/logs`),
  )
}
