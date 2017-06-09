import gulp from 'gulp'
import gutil from 'gulp-util'
import IAM from 'aws-sdk/clients/iam'
import KMS from 'aws-sdk/clients/kms'
import uniq from 'lodash/uniq'
import request from 'request-promise-native'
import querystring from 'querystring'
import opn from 'opn'

import devName, { requireDevNameSpecified } from './devName'
import publicStageName from './publicStageName'
import { awsOpts, allStages } from './secrets'
import { resolve, accessRoleArn } from './awsAccounts'
import { proj as credentialsFactory } from './awsCredentials'


const masterAccountId = '087916394902'
const deploySecretsKeyId = `arn:aws:kms:us-east-1:${masterAccountId}:key/9cef9467-af1d-45e6-bb16-030d8c1ec237`
const deploySecretsKeyOperations = ['Decrypt', 'GenerateDataKey']

const copyColor = gutil.colors.yellow

const opsUserName = () => `${devName()}.ops`

const opsUserArn = async () => {
  const iam = new IAM({ apiVersion: '2010-05-08', ...awsOpts })
  const getUserResult = await iam.getUser({
    UserName: opsUserName(),
  }).promise()
  return getUserResult.User.Arn
}

export default (proj, stages) => {

  gulp.task('who-am-i', async () => gutil.log(`devName: ${copyColor(devName())}`))

  gulp.task('add:ops-user', async () => {
    requireDevNameSpecified()
    const UserName = opsUserName()
    const devPublicStage = publicStageName('dev')
    const iam = new IAM({ apiVersion: '2010-05-08', ...awsOpts })
    const kms = new KMS({ apiVersion: '2014-11-01', ...awsOpts })
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
    gutil.log(`Get user to save the keys using: ${gutil.colors.dim('aws-keychain add mindhive-ops')}`)
    gutil.log(`They have already been granted access to secrets for the ${devPublicStage} stage in all projects`)
  })

  stages.forEach((stage) => {

    gulp.task(`grant:ops-user:secrets:${stage}`, async () => {
      requireDevNameSpecified()
      const kms = new KMS({ apiVersion: '2014-11-01', ...awsOpts })
      const userArn = await opsUserArn()
      await Promise.all(uniq([publicStageName(stage), allStages]).map(s =>
        kms.createGrant({
          KeyId: deploySecretsKeyId,
          GranteePrincipal: userArn,
          Name: [proj, s, devName()].join('/'),
          Constraints: { EncryptionContextSubset: { proj, stage: s } },
          Operations: deploySecretsKeyOperations,
        }).promise()
      ))
    })

    gulp.task(`grant:ops-user:access:${stage}`, async () => {
      requireDevNameSpecified()
      const iam = new IAM({ apiVersion: '2010-05-08', ...awsOpts })
      const account = await resolve({ proj, stage })
      const UserName = opsUserName()  // Perform this early to catch required param
      const PolicyName = `FullAccess@${account.Name}`
      const PolicyArn = `arn:aws:iam::${masterAccountId}:policy/${PolicyName}`
      try {
        await iam.getPolicy({ PolicyArn }).promise()
      } catch (e) {
        // assume it doesn't exist
        await iam.createPolicy({
          PolicyName,
          PolicyDocument: JSON.stringify({
            Version: '2012-10-17',
            Statement: {
              Effect: 'Allow',
              Action: 'sts:AssumeRole',
              Resource: accessRoleArn(account),
            },
          }),
        }).promise()
      }
      await iam.attachUserPolicy({ PolicyArn, UserName }).promise()
    })

    gulp.task(`open:aws:${stage}`, async () => {
      const credentials = credentialsFactory({ proj, stage })
      await credentials.getPromise()
      const tempCredentials = {
        sessionId: credentials.accessKeyId,
        sessionKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
      }
      const federation = await request({
        url: 'https://signin.aws.amazon.com/federation',
        qs: {
          Action: 'getSigninToken',
          Session: JSON.stringify(tempCredentials),
        },
        json: true,
      })
      opn(
        `https://signin.aws.amazon.com/federation?${querystring.stringify({
          Action: 'login',
          Issuer: '',
          Destination: 'https://console.aws.amazon.com/',
          SigninToken: federation.SigninToken,
          SessionDuration: 12 * 60 * 60,  // Max 12 hours
        })}`,
        { wait: false },
      )
    })

  })

}
