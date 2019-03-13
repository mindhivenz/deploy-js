import gulp from 'gulp'
// @ts-ignore
import cfDeploy from 'gulp-cf-deploy'
import jsonEditor from 'gulp-json-editor'
import rename from 'gulp-rename'
import path from 'path'

import awsServiceOptions from './awsServiceOptions'
import cidr16HashedPrefix from './cidr16HashedPrefix'

/* The following is required in the role launching this (like serverless iamRoleStatements)

    - Effect: Allow
      Action:
        - ec2:CreateNetworkInterface
        - ec2:DescribeNetworkInterfaces
        - ec2:DetachNetworkInterface
        - ec2:DeleteNetworkInterface
      Resource: "*"
 */

const numberedKeysToArray = (
  obj: Record<string, string>,
  keyPrefix: string,
) => {
  const result: string[] = []
  let i = 1
  while (`${keyPrefix}${i}` in obj) {
    result.push(obj[`${keyPrefix}${i}`])
    i += 1
  }
  return result
}

interface IOptions {
  proj: string
  stage: string
  region: string
  azCount?: number
  ipPrefix?: string
}

export default ({
  proj,
  stage,
  region,
  azCount = stage === 'dev' ? 1 : 2,
  ipPrefix = cidr16HashedPrefix(proj),
}: IOptions) =>
  gulp
    .src(path.join(__dirname, `cfn/vpc-${azCount}.cfn.yaml`))
    .pipe(
      cfDeploy(awsServiceOptions({ proj, stage, region }), `${proj}-vpc`, {
        ipPrefix,
      }),
    )
    .pipe(
      jsonEditor((awsVpcFlat: Record<string, string>) => ({
        ipAddresses: numberedKeysToArray(awsVpcFlat, 'ipAddressLambda'),
        securityGroupId: awsVpcFlat.securityGroupIdLambda,
        vpcSubnetIds: numberedKeysToArray(awsVpcFlat, 'vpcSubnetIdLambda'),
      })),
    )
    .pipe(rename('aws-vpc.json'))
