import { AWSError, CloudFormation } from 'aws-sdk'
import log from 'fancy-log'
import PluginError from 'plugin-error'
import awsServiceOptions, { IServiceOpts } from './awsServiceOptions'
import { IRegionalProjOptions } from './awsProjOptions'

interface IStackOps {
  stackName?: string
  cloudSecurityPostureManagement?: boolean
  externalId?: string
  ddApiKeyTextDoNotCommit?: string
  ddApiKeySecretArn?: string
  roleArn?: string
}

interface IOpts extends IStackOps {
  serviceOpts: IServiceOpts
}

interface ITaskOpts extends IRegionalProjOptions, IStackOps {}

const isNoUpdates = (e: AWSError) =>
  e.code === 'ValidationError' &&
  e.message.includes('No updates are to be performed')

export const updateDatadogIntegration = async ({
  serviceOpts,
  stackName = 'DatadogIntegration',
  cloudSecurityPostureManagement = false,
  externalId,
  ddApiKeyTextDoNotCommit,
  ddApiKeySecretArn,
  roleArn,
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
      "It looks like you haven't created the stack yet: https://app.datadoghq.com/account/settings#integrations/amazon-web-services" +
        `, or you have the wrong stack name (expected: ${stackName})`,
    )
  }
  try {
    await cloudFormation
      .updateStack({
        StackName: stackName,
        RoleARN: roleArn,
        TemplateURL:
          'https://datadog-cloudformation-template.s3.amazonaws.com/aws/main.yaml',
        Parameters: [
          {
            ParameterKey: 'ExternalId',
            ...(externalId
              ? { ParameterValue: externalId }
              : { UsePreviousValue: true }),
          },
          ...(ddApiKeyTextDoNotCommit
            ? [
                {
                  ParameterKey: 'DdApiKey',
                  ParameterValue: ddApiKeyTextDoNotCommit,
                },
              ]
            : ddApiKeySecretArn
            ? [
                {
                  ParameterKey: 'DdApiKeySecretArn',
                  ParameterValue: ddApiKeySecretArn,
                },
              ]
            : [{ ParameterKey: 'DdApiKey', UsePreviousValue: true }]),
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
  } catch (e) {
    if (!isNoUpdates(e as AWSError)) {
      throw e
    }
    log('Datadog integration already up to date')
    return
  }
  await cloudFormation
    .waitFor('stackUpdateComplete', { StackName: stackName })
    .promise()
}

export default ({
    stackName,
    cloudSecurityPostureManagement,
    externalId,
    ddApiKeySecretArn,
    ddApiKeyTextDoNotCommit,
    roleArn,
    ...projOpts
  }: ITaskOpts) =>
  async () => {
    await updateDatadogIntegration({
      stackName,
      cloudSecurityPostureManagement,
      externalId,
      ddApiKeySecretArn,
      ddApiKeyTextDoNotCommit,
      roleArn,
      serviceOpts: awsServiceOptions(projOpts),
    })
  }
