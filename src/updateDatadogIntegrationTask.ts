import { CloudFormation } from 'aws-sdk'
import PluginError from 'plugin-error'
import awsServiceOptions, { IServiceOpts } from './awsServiceOptions'
import { IRegionalProjOptions } from './internal/awsProjOptions'

const stackName = 'datadog'

export const updateDatadogIntegration = async (options: IServiceOpts) => {
  const cloudFormation = new CloudFormation(options)
  try {
    await cloudFormation.describeStacks({ StackName: stackName }).promise()
  } catch (e) {
    if (e.code !== 'ValidationError') {
      throw e
    }
    throw new PluginError(
      'updateDatadogIntegration',
      'You need to manually create the stack first: https://app.datadoghq.com/account/settings#integrations/amazon-web-services',
    )
  }
  await cloudFormation
    .updateStack({
      StackName: stackName,
      TemplateURL:
        'https://datadog-cloudformation-template.s3.amazonaws.com/aws/main.yaml',
      Parameters: [
        { ParameterKey: 'ExternalId', UsePreviousValue: true },
        { ParameterKey: 'DdApiKey', UsePreviousValue: true },
        {
          ParameterKey: 'IAMRoleName',
          ParameterValue: 'DatadogIntegrationRole',
        },
        {
          ParameterKey: 'CloudSecurityPostureManagementPermissions',
          ParameterValue: 'true',
        },
      ],
      Capabilities: ['CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'],
    })
    .promise()
}

export default (options: IRegionalProjOptions) => async () => {
  await updateDatadogIntegration(awsServiceOptions(options))
}
