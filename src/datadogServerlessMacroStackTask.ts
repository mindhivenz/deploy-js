import { AWSError, CloudFormation } from 'aws-sdk'
import awsServiceOptions from './awsServiceOptions'
import { IRegionalProjOptions } from './awsProjOptions'

const stackName = 'datadog-serverless-macro'

const stackOptions = {
  StackName: stackName,
  TemplateURL:
    'https://datadog-cloudformation-template.s3.amazonaws.com/aws/serverless-macro/latest.yml',
  Capabilities: ['CAPABILITY_AUTO_EXPAND', 'CAPABILITY_IAM'],
}

export default (options: IRegionalProjOptions) => async () => {
  const cloudFormation = new CloudFormation(awsServiceOptions(options))
  let exists: boolean
  try {
    await cloudFormation.describeStacks({ StackName: stackName }).promise()
    exists = true
  } catch (e) {
    if ((e as AWSError).code !== 'ValidationError') {
      throw e
    }
    exists = false
  }
  const request = exists
    ? cloudFormation.updateStack(stackOptions)
    : cloudFormation.createStack(stackOptions)
  await request.promise()
}
