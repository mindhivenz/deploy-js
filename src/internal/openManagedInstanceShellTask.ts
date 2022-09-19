import { SSM } from 'aws-sdk'
import { InstanceInformation } from 'aws-sdk/clients/ssm'
import sortBy from 'lodash/sortBy'
import PluginError from 'plugin-error'
import { prompt } from 'prompts'
import { IRegionalProjOptions } from '../awsProjOptions'
import awsServiceOptions from '../awsServiceOptions'
import { ssmInteractiveCommand } from './ssmInteractiveCommand'

export const openManagedInstanceShellTask =
  (opts: IRegionalProjOptions) => async () => {
    const serviceOpts = awsServiceOptions(opts)
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
        (inst.ComputerName || inst.InstanceId) +
        (inst.PingStatus === 'Online' ? '' : ` (${inst.PingStatus})`),
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
    await ssmInteractiveCommand(
      opts,
      answers.instanceId,
      'command="sudo -i -u root"',
    )
  }
