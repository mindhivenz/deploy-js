import { CloudFormation } from 'aws-sdk'
import PluginError from 'plugin-error'
import { IRegionalProjOptions } from './awsProjOptions'
import awsServiceOptions from './awsServiceOptions'

interface IOpts extends IRegionalProjOptions {
  stackName?: string
}

const pluginName = 'getCloudFormationOutputs'

export default async <T extends string>(
  names: T[],
  { stackName, ...serviceOpts }: IOpts,
): Promise<Record<T, string>> => {
  const cloudFormation = new CloudFormation(awsServiceOptions(serviceOpts))
  const outputs: Record<string, string | undefined> = {}
  if (stackName) {
    const stackResult = await cloudFormation
      .describeStacks({ StackName: stackName })
      .promise()
    stackResult.Stacks?.forEach((stack) => {
      stack.Outputs?.forEach((output) => {
        if (output.OutputKey) {
          outputs[output.OutputKey] = output.OutputValue
        }
      })
    })
  } else {
    const exportsResult = await cloudFormation.listExports().promise()
    exportsResult.Exports?.forEach((exp) => {
      if (exp.Name) {
        outputs[exp.Name] = exp.Value
      }
    })
  }
  return Object.fromEntries(
    names.map((name) => {
      const value = outputs[name]
      if (!value) {
        throw new PluginError(
          pluginName,
          `No ${
            stackName ? `${stackName} stack output` : 'CLoudFormation export'
          } found named: "${name}"`,
        )
      }
      return [name, value]
    }),
  ) as Record<T, string>
}
