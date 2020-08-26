import { SSM } from 'aws-sdk'
import sortBy from 'lodash/sortBy'
import { prompt } from 'prompts'
import awsCredentialsEnv from '../awsCredentialsEnv'
import awsServiceOptions from '../awsServiceOptions'
import execFile from '../execFile'
import PluginError from 'plugin-error'

interface IOptions {
  proj: string
  stage: string
  region: string
}

export const openManagedInstanceShellTask = (opts: IOptions) => async () => {
  const sessionOpts = {
    ...opts,
    fullDurationSession: true,
  }
  const serviceOpts = awsServiceOptions(sessionOpts)
  const ssm = new SSM(serviceOpts)
  const instances = await ssm.describeInstanceInformation().promise()
  const choices = instances.InstanceInformationList?.map((inst) => ({
    title: inst.ComputerName,
    value: inst.InstanceId,
  }))
  if (!choices) {
    throw new PluginError('open:shell', 'No instances found')
  }
  const answers = await prompt({
    type: 'autocomplete',
    name: 'instanceId',
    message: 'Host',
    choices: sortBy(choices, 'title'),
  })
  if (!answers.instanceId) {
    return
  }
  const awsEnv = await awsCredentialsEnv(sessionOpts)
  process.stdin.setRawMode(true)
  const sigIntHandler = () => {
    // Ignore it so we don't quit if ctrl-c in shell
  }
  process.on('SIGINT', sigIntHandler)
  await execFile(
    'aws',
    ['ssm', 'start-session', '--target', answers.instanceId],
    {
      env: {
        ...process.env,
        ...awsEnv,
      },
      pipeInput: true,
      pipeOutput: true,
    },
  )
  process.off('SIGINT', sigIntHandler)
}
