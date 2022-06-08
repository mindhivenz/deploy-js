import { AWSError, CloudFormation } from 'aws-sdk'
import PluginError from 'plugin-error'
import awsServiceOptions, { IServiceOpts } from './awsServiceOptions'
import { IRegionalProjOptions } from './internal/awsProjOptions'

const stackName = 'datadog'

interface IOpts {
  serviceOpts: IServiceOpts
  cloudSecurityPostureManagement?: boolean
}

interface ITaskOpts extends IRegionalProjOptions {
  cloudSecurityPostureManagement?: boolean
}

export const updateDatadogIntegration = async ({
  serviceOpts,
  cloudSecurityPostureManagement = false,
}: IOpts) => {
  const cloudFormation = new CloudFormation(serviceOpts)
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
          ParameterValue: cloudSecurityPostureManagement ? 'true' : 'false',
        },
      ],
      Capabilities: ['CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'],
    })
    .promise()
}

export default ({ cloudSecurityPostureManagement, ...projOpts }: ITaskOpts) =>
  async () => {
    await updateDatadogIntegration({
      serviceOpts: awsServiceOptions(projOpts),
      cloudSecurityPostureManagement,
    })
  }
