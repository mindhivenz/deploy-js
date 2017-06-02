import gulp from 'gulp'
import gutil from 'gulp-util'
import yargs from 'yargs'
import IAM from 'aws-sdk/clients/iam'
import KMS from 'aws-sdk/clients/kms'
import once from 'lodash/once'

import devName, { requireDevNameSpecified } from './devName'
import publicStageName from './publicStageName'
import * as profiles from './awsProfiles'
import { fromProfile } from './awsServiceOptions'
import { secretRegion, allStages } from './secrets'


const deploySecretsKeyId = 'arn:aws:kms:us-east-1:087916394902:key/9cef9467-af1d-45e6-bb16-030d8c1ec237'
const deploySecretsKeyOperations = ['Decrypt', 'GenerateDataKey']

const masterOptions = once(() =>
  fromProfile({ profile: profiles.master, region: secretRegion })
)

const copyColor = gutil.colors.yellow

const opsUserName = () => `${devName()}.ops`

const opsUserArn = async () => {
  const iam = new IAM({ apiVersion: '2010-05-08', ...masterOptions() })
  const getUserResult = await iam.getUser({
    UserName: opsUserName(),
  }).promise()
  return getUserResult.User.Arn
}

export default (proj, stages) => {

  gulp.task('who-am-i', async () => gutil.log(`devName: ${copyColor(devName())}`))

  gulp.task('add:ops:user', async () => {
    requireDevNameSpecified()
    const UserName = opsUserName()
    const devPublicStage = publicStageName('dev')
    const iam = new IAM({ apiVersion: '2010-05-08', ...masterOptions() })
    const kms = new KMS({ apiVersion: '2014-11-01', ...masterOptions() })
    const createUserResult = await iam.createUser({
      UserName,
      Path: '/ops/',
    }).promise()
    await iam.addUserToGroup({
      UserName,
      GroupName: 'ops',
    }).promise()
    await kms.createGrant({
      KeyId: deploySecretsKeyId,
      GranteePrincipal: createUserResult.User.Arn,
      Name: devPublicStage,
      Constraints: { EncryptionContextSubset: { stage: devPublicStage } },
      Operations: deploySecretsKeyOperations,
    }).promise()
    const createAccessKeyResult = await iam.createAccessKey({
      UserName,
    }).promise()
    const accessKey = createAccessKeyResult.AccessKey
    gutil.log('Copy the SecretAccessKey now, it cannot be retrieved again')
    gutil.log(`UserName: ${UserName}`)
    gutil.log(`AccessKeyId: ${copyColor(accessKey.AccessKeyId)}`)
    gutil.log(`SecretAccessKey: ${copyColor(accessKey.SecretAccessKey)}`)
  })

  stages.forEach((stage) => {
    gulp.task(`grant:ops:user:${stage}`, async () => {
      requireDevNameSpecified()
      yargs
        .describe('proj', 'The project name')
        .default('proj', proj)
      const kms = new KMS({ apiVersion: '2014-11-01', ...masterOptions() })
      const userArn = await opsUserArn()
      const specifiedProj = yargs.argv.proj
      await Promise.all([publicStageName(stage), allStages].map(s =>
        kms.createGrant({
          KeyId: deploySecretsKeyId,
          GranteePrincipal: userArn,
          Name: [specifiedProj, s, devName()].join('/'),
          Constraints: { EncryptionContextSubset: { proj: specifiedProj, stage: s } },
          Operations: deploySecretsKeyOperations,
        }).promise()
      ))
    })
  })

}
