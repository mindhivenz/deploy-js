import { SSM } from 'aws-sdk'
import { InstanceInformation } from 'aws-sdk/clients/ssm'
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
  const instances: InstanceInformation[] = []
  let token: string | undefined
  do {
    const instanceResult = await ssm
      .describeInstanceInformation({
        NextToken: token,
        MaxResults: 50,
      })
      .promise()
    if (instanceResult.InstanceInformationList) {
      instances.push(...instanceResult.InstanceInformationList)
    }
    token = instanceResult.NextToken
  } while (token)
  if (instances.length === 0) {
    throw new PluginError('open:shell', 'No instances found')
  }
  const choices = instances.map((inst) => ({
    title:
      inst.PingStatus === 'Online'
        ? inst.ComputerName
        : `${inst.ComputerName} (${inst.PingStatus})`,
    value: inst.InstanceId,
  }))
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
  try {
    await execFile(
      'aws',
      [
        'ssm',
        'start-session',
        ...['--target', answers.instanceId],
        ...['--document-name', 'AWS-StartInteractiveCommand'],
        // REVISIT: an alternative is to use the new ShellProfile of SSM-SessionManagerRunShell in agent 3.0
        ...['--parameters', 'command="sudo -i -u root"'],
      ],
      {
        env: {
          ...process.env,
          ...awsEnv,
        },
        pipeInput: true,
        pipeOutput: true,
      },
    )
  } finally {
    process.off('SIGINT', sigIntHandler)
  }
}
