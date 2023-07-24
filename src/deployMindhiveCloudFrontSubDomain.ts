import { src } from 'gulp'
import cfDeploy from 'gulp-cf-deploy'
import path from 'path'
import PluginError from 'plugin-error'

import { master } from './internal/awsMasterCredentials'

interface IOptions {
  domainName: string
  cloudFrontDomainName: string
  stackName?: string
}

const requiredDomainSuffix = '.mindhive.cloud'

export default ({
  domainName,
  cloudFrontDomainName,
  stackName = `dns-${domainName.replace('.', '-')}`,
}: IOptions) => {
  if (!domainName.endsWith(requiredDomainSuffix)) {
    throw new PluginError(
      'deployMindhiveCloudFrontSubDomain',
      `domainName must be in: ${requiredDomainSuffix}`,
    )
  }
  return src(
    path.join(__dirname, 'cfn/mindhive-cloud-front-sub-domain.cfn.yaml'),
  ).pipe(
    cfDeploy(
      { credentials: master, region: 'us-east-1' },
      {
        ResourceTypes: [
          // Because the of the policy conditions
          'AWS::Route53::RecordSet',
        ],
        StackName: stackName,
      },
      { domainName, cloudFrontDomainName },
    ),
  )
}
