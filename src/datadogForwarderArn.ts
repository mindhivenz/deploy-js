import { CloudFormation } from 'aws-sdk'
import PluginError from 'plugin-error'
import awsServiceOptions from './awsServiceOptions'
import { datadogForwarderStackName } from './datadogForwarderTask'
import { IRegionalProjOptions } from './internal/awsProjOptions'

const plugin = '@mindhive/deploy/datadogForwarderArn'
const outputKey = 'DatadogForwarderArn'

export default async (options: IRegionalProjOptions) => {
  const cloudFormation = new CloudFormation(awsServiceOptions(options))
  const describeStacksResult = await cloudFormation
    .describeStacks({
      StackName: datadogForwarderStackName,
    })
    .promise()
  if (!describeStacksResult.Stacks?.length) {
    throw new PluginError(
      plugin,
      `No existing ${datadogForwarderStackName} stack`,
    )
  }
  const output = describeStacksResult.Stacks[0].Outputs?.find(
    (o) => o.OutputKey === outputKey,
  )
  if (!output) {
    throw new PluginError(plugin, `No output ${outputKey} found in stack`)
  }
  return output.OutputValue!
}
