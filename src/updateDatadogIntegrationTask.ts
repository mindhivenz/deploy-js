import { AWSError, CloudFormation } from 'aws-sdk'
import PluginError from 'plugin-error'
import awsServiceOptions, { IServiceOpts } from './awsServiceOptions'
import { IRegionalProjOptions } from './awsProjOptions'

interface IStackOps {
  stackVersion: 'v1' | 'v2'
  cloudSecurityPostureManagement?: boolean
  externalId?: string
}

interface IOpts extends IStackOps {
  serviceOpts: IServiceOpts
}

interface ITaskOpts extends IRegionalProjOptions, IStackOps {}

export const updateDatadogIntegration = async ({
  serviceOpts,
  stackVersion,
  cloudSecurityPostureManagement = false,
  externalId,
}: IOpts) => {
  const cloudFormation = new CloudFormation(serviceOpts)
  const stackName = stackVersion === 'v1' ? 'datadog' : 'DatadogIntegration'
  try {
    await cloudFormation.describeStacks({ StackName: stackName }).promise()
  } catch (e) {
    if ((e as AWSError).code !== 'ValidationError') {
      throw e
    }
    throw new PluginError(
      'updateDatadogIntegration',
      'You need to manually create the stack first: https://app.datadoghq.com/account/settings#integrations/amazon-web-services',
    )
  }
  const versionedParams =
    stackVersion === 'v1'
      ? [{ ParameterKey: 'DdApiKey', UsePreviousValue: true }]
      : [
          { ParameterKey: 'APIKey', UsePreviousValue: true },
          { ParameterKey: 'APPKey', UsePreviousValue: true },
        ]
  await cloudFormation
    .updateStack({
      StackName: stackName,
      TemplateURL:
        'https://datadog-cloudformation-template.s3.amazonaws.com/aws/main.yaml',
      Parameters: [
        ...versionedParams,
        {
          ParameterKey: 'ExternalId',
          ...(externalId
            ? { ParameterValue: externalId }
            : { UsePreviousValue: true }),
        },
        {
          ParameterKey: 'IAMRoleName',
          ParameterValue: 'DatadogIntegrationRole',
        },
        {
          ParameterKey: 'CloudSecurityPostureManagementPermissions',
          ParameterValue: cloudSecurityPostureManagement ? 'true' : 'false',
        },
      ],
      Capabilities: ['CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'],
    })
    .promise()
}

export default ({
    stackVersion,
    cloudSecurityPostureManagement,
    externalId,
    ...projOpts
  }: ITaskOpts) =>
  async () => {
    await updateDatadogIntegration({
      stackVersion,
      cloudSecurityPostureManagement,
      externalId,
      serviceOpts: awsServiceOptions(projOpts),
    })
  }
