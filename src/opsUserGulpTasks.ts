import log from 'fancy-log'
import { task } from 'gulp'
import devName from './devName'
import addAwsVaultProfile from './internal/addAwsVaultProfile'
import { toCopy } from './colors'
import { userRoleName } from './userRoleName'
import openAwsConsoleTask from './internal/openAwsConsoleTask'
import { openManagedInstanceShellTask } from './internal/openManagedInstanceShellTask'
import { globalArgs, parseArgs } from './internal/args'

interface IOptions {
  proj: string
  stages: string[]
  region: string
}

export default ({ proj, stages, region }: IOptions) => {
  task('who-am-i', async () => {
    log(`You are devName: ${toCopy(devName())}`)
  })

  stages.forEach((stage) => {
    task(`open:aws:${stage}`, openAwsConsoleTask({ proj, stage, region }))

    task(`add:aws-vault:${stage}`, async () => {
      const args = parseArgs(
        globalArgs.option('profile-name', {
          type: 'string',
        }),
      )
      await addAwsVaultProfile({
        proj,
        stage,
        region,
        roleName: userRoleName,
        profileName: args.profileName,
      })()
    })

    task(
      `open:shell:${stage}`,
      openManagedInstanceShellTask({ proj, stage, region }),
    )

    if (stage === 'production') {
      task(`open:aws`, openAwsConsoleTask({ proj, stage, region }))
      task(`open:shell`, openManagedInstanceShellTask({ proj, stage, region }))
    }
  })

  if (!stages.includes('dev')) {
    const stage = 'dev'
    task(`open:aws:${stage}`, openAwsConsoleTask({ proj, stage, region }))

    task(`add:aws-vault:${stage}`, async () => {
      const args = parseArgs(
        globalArgs.option('profile-name', {
          type: 'string',
        }),
      )
      await addAwsVaultProfile({
        proj,
        stage,
        region,
        roleName: userRoleName,
        profileName: args.profileName,
      })()
    })
  }
}
