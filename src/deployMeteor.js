import gutil from 'gulp-util'
import streamToPromise from 'stream-to-promise'
import run from 'gulp-run'


export default async ({
  host,
  meteorRootPath,
  galaxyRegion,
  meteorSettingsPath,
}) => {
  const galaxyManagementServer = `${galaxyRegion}.galaxy.meteor.com`
  await streamToPromise(
    run(`meteor deploy ${host} --settings ${meteorSettingsPath}`, {
      env: {
        ...process.env,
        DEPLOY_HOSTNAME: galaxyManagementServer,
      },
      cwd: meteorRootPath,
    }).exec()
  )
  gutil.log(
    `Check status of Mete${gutil.colors.red('o')}r deployment at`,
    gutil.colors.blue(`https://${galaxyManagementServer}/app/${host}/logs`),
  )
}
