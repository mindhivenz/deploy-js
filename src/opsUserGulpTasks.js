import gulp from 'gulp'
import gutil from 'gulp-util'

import devName from './devName'
import openAwsConsoleTask from './openAwsConsoleTask'
import addAwsVaultProfile from './addAwsVaultProfile'


export default ({ proj, stages, region }) => {

  gulp.task('who-am-i', async () => {
    gutil.log(`You are devName: ${gutil.colors.yellow(devName())}`)
  })

  stages.forEach((stage) => {
    gulp.task(`open:aws:${stage}`, openAwsConsoleTask({ proj, stage, region }))
  })

  stages.forEach((stage) => {
    gulp.task(`add:aws-vault:${stage}`, addAwsVaultProfile({ proj, stage, region }))
  })

}
