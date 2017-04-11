import cloudformation from 'gulp-cloudformation'
import gulp from 'gulp'
import path from 'path'


const getServiceOptions = () => {
  const AWS = require('aws-sdk/global')  // eslint-disable-line
  const credentials = new AWS.SharedIniFileCredentials({ profile: 'mindhive.cloud' })
  return {
    credentials,
    region: 'us-east-1',
  }
}

export default ({
  proj,
  stage,
  domainName,
  cloudFrontDomainName,
}) =>
  gulp.src(path.join(__dirname, '../cfn/mindhive-cloud-front-sub-domain.cfn.yaml'))
    .pipe(cloudformation.init(getServiceOptions()))
    .pipe(cloudformation.deploy({
      StackName: `${proj}-${stage}-domain`,
      ResourceTypes: [  // Because the of the policy conditions
        'AWS::Route53::RecordSet',
      ],
      Parameters: [
        { ParameterKey: 'domainName', ParameterValue: domainName },
        { ParameterKey: 'cloudFrontDomainName', ParameterValue: cloudFrontDomainName },
      ],
    }))
