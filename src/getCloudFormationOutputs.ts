import { CloudFormation } from 'aws-sdk'
import PluginError from 'plugin-error'
import { IRegionalProjOptions } from './awsProjOptions'
import awsServiceOptions from './awsServiceOptions'

interface IOpts extends IRegionalProjOptions {
  cdkStack?: string
}

const pluginName = 'getCloudFormationOutputs'

export default async <T extends string>(
  names: T[],
  { cdkStack, ...serviceOpts }: IOpts,
): Promise<Record<T, string>> => {
  const cloudFormation = new CloudFormation(awsServiceOptions(serviceOpts))
  const exportsResult = await cloudFormation.listExports().promise()
  const exports = exportsResult.Exports
  if (!exports) {
    throw new PluginError(pluginName, `No exports returned in result`)
  }
  return Object.fromEntries(
    names.map((name) => {
      const matchName = cdkStack ? `${cdkStack}.${name}` : name
      const nameExport = exports.find((exp) => exp.Name === name)
      if (!nameExport) {
        throw new PluginError(
          pluginName,
          `No CloudFormation output found named: "${name}"`,
        )
      }
      const value = nameExport.Value
      if (value == null) {
        throw new PluginError(
          pluginName,
          `CloudFormation output: "${name}" has no value`,
        )
      }
      return [name, nameExport.Value]
    }),
  ) as Record<T, string>
}
