import cfDeploy from 'gulp-cf-deploy'
import gulp from 'gulp'
import path from 'path'

import { master } from './awsCredentials'

export default ({ proj, stage, domainName, cloudFrontDomainName }) =>
  gulp
    .src(
      path.join(__dirname, '../cfn/mindhive-cloud-front-sub-domain.cfn.yaml'),
    )
    .pipe(
      cfDeploy(
        { credentials: master, region: 'us-east-1' },
        {
          StackName: `${proj}-${stage}-domain`,
          ResourceTypes: [
            // Because the of the policy conditions
            'AWS::Route53::RecordSet',
          ],
        },
        { domainName, cloudFrontDomainName },
      ),
    )
