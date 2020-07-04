import fetch from 'node-fetch'
import cfDeploy from 'gulp-cf-deploy'
import awsServiceOptions from './awsServiceOptions'
import buildSrc from './buildSrc'

const fetchForwarderTemplate = async () => {
  const res = await fetch(
    'https://raw.githubusercontent.com/DataDog/datadog-serverless-functions/master/aws/logs_monitoring/template.yaml',
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch the template: ${res.statusText}`)
  }
  return res.text()
}

interface IOptions {
  proj: string
  stage: string
  region: string
  apiKeySecretArn: string
}

export default ({ proj, stage, region, apiKeySecretArn }: IOptions) => () =>
  buildSrc('template.yaml', fetchForwarderTemplate()).pipe(
    cfDeploy(
      awsServiceOptions({ proj, stage, region }),
      {
        Capabilities: ['CAPABILITY_AUTO_EXPAND', 'CAPABILITY_IAM'],
        StackName: 'datadog-forwarder',
      },
      {
        DdApiKey: 'Not used - in SSM',
        DdApiKeySecretArn: apiKeySecretArn,
      },
    ),
  )
