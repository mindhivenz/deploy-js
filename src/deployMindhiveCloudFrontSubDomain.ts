import gulp from 'gulp'
// @ts-ignore
import cfDeploy from 'gulp-cf-deploy'
import path from 'path'

import { master } from './internal/awsCredentials'

interface IOptions {
  proj: string
  stage: string
  domainName: string
  cloudFrontDomainName: string
}

export default ({ proj, stage, domainName, cloudFrontDomainName }: IOptions) =>
  gulp
    .src(path.join(__dirname, 'cfn/mindhive-cloud-front-sub-domain.cfn.yaml'))
    .pipe(
      cfDeploy(
        { credentials: master, region: 'us-east-1' },
        {
          ResourceTypes: [
            // Because the of the policy conditions
            'AWS::Route53::RecordSet',
          ],
          StackName: `${proj}-${stage}-domain`,
        },
        { domainName, cloudFrontDomainName },
      ),
    )
