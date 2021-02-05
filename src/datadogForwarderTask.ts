import fetch from 'node-fetch'
import cfDeploy from 'gulp-cf-deploy'
import awsServiceOptions from './awsServiceOptions'
import buildSrc from './buildSrc'
import { IRegionalProjOptions } from './internal/awsProjOptions'

export const datadogForwarderStackName = 'datadog-forwarder'

const fetchForwarderTemplate = async () => {
  const res = await fetch(
    'https://raw.githubusercontent.com/DataDog/datadog-serverless-functions/master/aws/logs_monitoring/template.yaml',
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch the template: ${res.statusText}`)
  }
  return res.text()
}

interface IOptions extends IRegionalProjOptions {
  apiKeySecretArn: string
}

export default ({ apiKeySecretArn, ...projOptions }: IOptions) => {
  return () =>
    buildSrc('template.yaml', fetchForwarderTemplate()).pipe(
      cfDeploy(
        awsServiceOptions(projOptions),
        {
          Capabilities: ['CAPABILITY_AUTO_EXPAND', 'CAPABILITY_IAM'],
          StackName: datadogForwarderStackName,
        },
        {
          DdApiKey: 'Not used - in SSM',
          DdApiKeySecretArn: apiKeySecretArn,
        },
      ),
    )
}
