import gulp from 'gulp'
import gutil from 'gulp-util'
import IAM from 'aws-sdk/clients/iam'
import KMS from 'aws-sdk/clients/kms'
import request from 'request-promise-native'
import querystring from 'querystring'
import opn from 'opn'
import yargs from 'yargs'

import devName, { requireDevNameSpecified } from './devName'
import publicStageName from './publicStageName'
import { awsOpts, allStages } from './secrets'
import { accountNameCombinations, resolve, accessRoleArn } from './awsAccounts'
import { proj as credentialsFactory } from './awsCredentials'


const masterAccountId = '087916394902'
const deploySecretsKeyId = `arn:aws:kms:us-east-1:${masterAccountId}:key/9cef9467-af1d-45e6-bb16-030d8c1ec237`
const opsUserName = () => {
  requireDevNameSpecified()
  return `${devName()}.ops`
}

const iamFactory = () => new IAM({ apiVersion: '2010-05-08', ...awsOpts })
const kmsFactory = () => new KMS({ apiVersion: '2014-11-01', ...awsOpts })

const opsUserArn = async () => {
  const iam = iamFactory()
  const getUserResult = await iam.getUser({
    UserName: opsUserName(),
  }).promise()
  return getUserResult.User.Arn
}

const grantSecrets = async (userArn, grants) => {
  const kms = kmsFactory()
  await Promise.all(grants.map(({ proj, stage }) => {
    if (! proj && stage !== publicStageName('dev')) {
      throw new Error("Can only grant organization-wide to a user's own dev stage")
    }
    const Name = proj ? `${proj}/${stage || 'any'}/${devName()}` : stage
    return kms.createGrant({
      KeyId: deploySecretsKeyId,
      GranteePrincipal: userArn,
      Name,
      Constraints: { EncryptionContextSubset: { proj, stage } },
      Operations: ['Decrypt', 'GenerateDataKey'],
    }).promise()
  }))
}

const copyColor = gutil.colors.yellow

export default (proj, stages) => {

  gulp.task('who-am-i', async () =>
    gutil.log(`You are devName: ${copyColor(devName())}`)
  )

  // TODO: list secrets

  gulp.task('create:ops-user', async () => {
    yargs.usage('Create a new AWS IAM ops user')
    const UserName = opsUserName()  // Perform this early to catch required param
    const devPublicStage = publicStageName('dev')
    const iam = iamFactory()
    const createUserResult = await iam.createUser({ UserName, Path: '/ops/' }).promise()
    await iam.addUserToGroup({ UserName, GroupName: 'ops' }).promise()
    await grantSecrets(createUserResult.User.Arn, [{ stage: devPublicStage }])
    const createAccessKeyResult = await iam.createAccessKey({ UserName }).promise()
    const accessKey = createAccessKeyResult.AccessKey
    gutil.log([
      `${gutil.colors.underline('Copy the SecretAccessKey now')}, it cannot be retrieved again!`,
      `UserName: ${UserName}`,
      `AccessKeyId: ${copyColor(accessKey.AccessKeyId)}`,
      `SecretAccessKey: ${copyColor(accessKey.SecretAccessKey)}`,
      `Get ${devName()} to save the keys using: ${gutil.colors.blue('aws-keychain add mindhive-ops')}`,
      `They have been granted access to secrets in the ${devPublicStage} stage of any project.`,
      "Note: the above grant doesn't include secrets in the 'all' stage of a project, you need to grant for that.",
      "Next you'll probably want to use one of:",
      gulp.tree()
        .filter(t => t.startsWith('grant:ops-user:'))
        .map(t => `- ${gutil.colors.cyan(t)}`)
    ].join('\n'))
  })

  // TODO: 'grant:ops-user:access'

  gulp.task('grant:ops-user:secrets', async () => {
    yargs.usage(`Grant an ops user access to ${proj} secrets in any stage`)
    const userArn = await opsUserArn()
    await grantSecrets(userArn, [{ proj }])
  })

  stages.forEach((stage) => {

    gulp.task(`create:aws:account:${stage}`, async () => {
      const validNames = accountNameCombinations({ proj, stage })
      const name = yargs
        .describe('name', 'The name of the AWS account')
        .choices('name', validNames)
        .demandOption(['name'])
        .argv
        .name
      // TODO: check matches one of the names
      // TODO: create account
      // TODO: wait for account in correct state
      if (name !== publicStageName('dev')) {
        // TODO: create group (is doesn't exist) and policy, attach policy to group
      }
    })

    // TODO: setup::aws:account:${stage} (same as post step in create:aws:account:${stage})

    gulp.task(`grant:ops-user:secrets:${stage}`, async () => {
      yargs.usage(`Grant an ops user access to ${proj} ${stage} secrets`)
      const userArn = await opsUserArn()  // Perform this early to catch required param
      await grantSecrets(
        userArn,
        [
          { proj, stage: publicStageName(stage) },
          { proj, stage: allStages },
        ],
      )
    })

    gulp.task(`grant:ops-user:access:${stage}`, async () => {
      const account = await resolve({ proj, stage })
      yargs.usage(`Grant an ops user full access to the ${account.name} AWS account`)
      const UserName = opsUserName()  // Perform this early to catch required param
      const PolicyName = `FullAccess@${account.Name}`
      const PolicyArn = `arn:aws:iam::${masterAccountId}:policy/${PolicyName}`
      const iam = iamFactory()
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
