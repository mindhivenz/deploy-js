import hash from 'hash-mod'
import gulp from 'gulp'
import cloudformation from 'gulp-cloudformation'
import jsonEditor from 'gulp-json-editor'
import rename from 'gulp-rename'
import path from 'path'

import getAwsServiceOptions from './getAwsServiceOptions'


const hashIpPrefix = proj =>
  `10.${hash(256)(proj)}`

const numberedKeysToArray = (obj, keyPrefix) => {
  const result = []
  let number = 1
  while (`${keyPrefix}${number}` in obj) {
    result.push(obj[`${keyPrefix}${number}`])
    number += 1
  }
  return result
}

export default ({
  proj,
  stage,
  region,
  azCount = stage === 'dev' ? 1 : 2,
  ipPrefix = hashIpPrefix(proj),
}) =>
  gulp.src(path.join(__dirname, `../cfn/vpc-${azCount}.cfn.yaml`))
    .pipe(cloudformation.init(getAwsServiceOptions({ proj, stage, region })))
    .pipe(cloudformation.deploy({
      StackName: `${proj}-vpc`,
      Parameters: [
        { ParameterKey: 'ipPrefix', ParameterValue: ipPrefix },
      ],
    }))
    .pipe(jsonEditor(awsVpcFlat => ({
      securityGroupId: awsVpcFlat.securityGroupIdLambda,
      vpcSubnetIds: numberedKeysToArray(awsVpcFlat, 'vpcSubnetIdLambda'),
      ipAddresses: numberedKeysToArray(awsVpcFlat, 'ipAddressLambda'),
    })))
    .pipe(rename('aws-vpc.json'))
