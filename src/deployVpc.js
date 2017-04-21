import hash from 'hash-mod'
import gulp from 'gulp'
import cfDeploy from 'gulp-cf-deploy'
import jsonEditor from 'gulp-json-editor'
import rename from 'gulp-rename'
import path from 'path'

import awsServiceOptions from './awsServiceOptions'

/* The following is required in the role launching this (like serverless iamRoleStatements)

    - Effect: Allow
      Action:
        - ec2:CreateNetworkInterface
        - ec2:DescribeNetworkInterfaces
        - ec2:DetachNetworkInterface
        - ec2:DeleteNetworkInterface
      Resource: "*"
 */

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
    .pipe(cfDeploy(
      awsServiceOptions({ proj, stage, region }),
      `${proj}-vpc`,
      { ipPrefix },
    ))
    .pipe(jsonEditor(awsVpcFlat => ({
      securityGroupId: awsVpcFlat.securityGroupIdLambda,
      vpcSubnetIds: numberedKeysToArray(awsVpcFlat, 'vpcSubnetIdLambda'),
      ipAddresses: numberedKeysToArray(awsVpcFlat, 'ipAddressLambda'),
    })))
    .pipe(rename('aws-vpc.json'))
