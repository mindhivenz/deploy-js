import log from 'fancy-log'
import colors from 'ansi-colors'
import getStream from 'get-stream'
import run from 'gulp-run'


export default async ({
  host,
  meteorRootPath,
  galaxyRegion,
  meteorSettingsPath,
}) => {
  const galaxyManagementServer = `${galaxyRegion}.galaxy.meteor.com`
  await getStream.array(  // REVISIT: use our own run, then we don't need getStream
    run(`meteor deploy ${host} --settings ${meteorSettingsPath}`, {
      env: {
        ...process.env,
        DEPLOY_HOSTNAME: galaxyManagementServer,
      },
      cwd: meteorRootPath,
      verbosity: 3,  // As Meteor sometimes asks for username password so we need to see what's happening
    }).exec()
  )
  log(
    `Check status of Mete${colors.red('o')}r deployment at`,
    colors.blue(`https://${galaxyManagementServer}/app/${host}/logs`),
  )
}
