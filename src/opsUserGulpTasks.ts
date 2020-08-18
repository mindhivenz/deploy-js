import log from 'fancy-log'
import gulp from 'gulp'
import devName from './devName'
import addAwsVaultProfile from './internal/addAwsVaultProfile'
import { toCopy } from './internal/colors'
import openAwsConsoleTask from './internal/openAwsConsoleTask'
import { openManagedInstanceShellTask } from './internal/openManagedInstanceShellTask'

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

    gulp.task(
      `add:aws-vault:${stage}`,
      addAwsVaultProfile({ proj, stage, region }),
    )

    gulp.task(
      `open:shell:${stage}`,
      openManagedInstanceShellTask({ proj, stage, region }),
    )

    if (stage === 'production') {
      gulp.task(`open:aws`, openAwsConsoleTask({ proj, stage, region }))
      gulp.task(
        `open:shell`,
        openManagedInstanceShellTask({ proj, stage, region }),
      )
    }
  })
}
