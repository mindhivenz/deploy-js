import { CloudFormation } from 'aws-sdk'
import PluginError from 'plugin-error'
import awsServiceOptions from './awsServiceOptions'
import { IRegionalProjOptions } from './internal/awsProjOptions'

const stackName = 'datadog'

export default (options: IRegionalProjOptions) => async () => {
  const cloudFormation = new CloudFormation(awsServiceOptions(options))
  let exists: boolean
  try {
    await cloudFormation.describeStacks({ StackName: stackName }).promise()
    exists = true
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
