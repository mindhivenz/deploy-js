import log from 'fancy-log'
import gulp from 'gulp'
import devName from './devName'
import addAwsVaultProfile from './internal/addAwsVaultProfile'
import { toCopy } from './internal/colors'
import openAwsConsoleTask from './openAwsConsoleTask'

interface IOptions {
  proj: string
  stages: string[]
  region: string
}

export default ({ proj, stages, region }: IOptions) => {
  gulp.task('who-am-i', async () => {
    log(`You are devName: ${toCopy(devName())}`)
  })

  stages.forEach((stage) => {
    gulp.task(`open:aws:${stage}`, openAwsConsoleTask({ proj, stage, region }))
  })

  stages.forEach((stage) => {
    gulp.task(
      `add:aws-vault:${stage}`,
      addAwsVaultProfile({ proj, stage, region }),
    )
  })
}
