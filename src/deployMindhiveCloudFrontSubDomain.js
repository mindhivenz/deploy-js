import cfDeploy from 'gulp-cf-deploy'
import gulp from 'gulp'
import path from 'path'

import { fromProfile } from './awsServiceOptions'
import * as profiles from './awsProfiles'


export default ({
  proj,
  stage,
  domainName,
  cloudFrontDomainName,
}) =>
  gulp.src(path.join(__dirname, '../cfn/mindhive-cloud-front-sub-domain.cfn.yaml'))
    .pipe(cfDeploy(
      fromProfile({ profile: profiles.ops, region: 'us-east-1' }),
      {
        StackName: `${proj}-${stage}-domain`,
        ResourceTypes: [  // Because the of the policy conditions
          'AWS::Route53::RecordSet',
        ],
      },
      { domainName, cloudFrontDomainName },
    ))
