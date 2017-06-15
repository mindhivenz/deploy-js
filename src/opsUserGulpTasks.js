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
import { allStages } from './secrets'
import {
  masterAccountId,
  iamPath,
  awsOpts,
  accountNameCombinations,
  devsOwnAccountName,
  resolveAccount,
  accessTargetRoleArn,
  accessSourcePolicyName,
  accessSourcePolicyArn,
  extractGroupName,
  resolveGroupName,
} from './awsAccounts'
import { proj as credentialsFactory } from './awsCredentials'

// REVISIT: Can / should we do this all through a declarative file (including secret grants), kinda like CFN?

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

const retryPause = () => new Promise(resolve => setTimeout(resolve, 1000))

const copyColor = gutil.colors.yellow

export default ({ proj, stages, region }) => {

  gulp.task('who-am-i', async () =>
    gutil.log(`You are devName: ${copyColor(devName())}`)
  )

  // TODO: list secrets
  // TODO: list grants

  gulp.task('create:ops-user', async () => {
    yargs.usage('Create a new AWS IAM ops user')
    const UserName = opsUserName()  // Perform this early to catch required param
    const devPublicStage = publicStageName('dev')
    const iam = iamFactory()
    const createUserResult = await iam.createUser({ UserName, Path: iamPath }).promise()
    await iam.addUserToGroup({ UserName, GroupName: 'ops' }).promise()
    const userArn = createUserResult.User.Arn
    for (;;) {
      try {
        await grantSecrets(userArn, [{ stage: devPublicStage }])
        break
      } catch (e) {
        if (e.code !== 'InvalidArnException') {
          throw e
        }
        gutil.log('Waiting for user to be available for grant...')
        await retryPause()
      }
    }
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
      ...gulp.tree()
        .nodes
        .filter(t => t.startsWith('grant:ops-user:'))
        .map(t => `- ${gutil.colors.cyan(t)}`)
    ].join('\n'))
  })

  gulp.task('grant:ops-user:secrets', async () => {
    yargs.usage(`Grant an ops user access to ${proj} secrets in any stage`)
    const userArn = await opsUserArn()
    await grantSecrets(userArn, [{ proj }])
  })

  gulp.task('grant:ops-user:access', async () => {
    const GroupName = await resolveGroupName({ proj })
    if (GroupName === proj) {
      yargs.usage(`Grant an ops user access to all stages in the ${GroupName} project`)
    } else {
      yargs.usage(`Grant an ops user access to all projects and stages in the ${GroupName} group`)
    }
    const UserName = opsUserName()
    const iam = iamFactory()
    await iam.addUserToGroup({ GroupName, UserName }).promise()
  })

  stages.forEach((stage) => {

    const createAccountIam = async (accountName, accountId) => {
      const iam = iamFactory()
      const PolicyName = accessSourcePolicyName(accountName)
      const createPolicyResult = await iam.createPolicy({
        PolicyName,
        PolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: {
            Effect: 'Allow',
            Action: 'sts:AssumeRole',
            Resource: accessTargetRoleArn(accountId),
          },
        }),
      }).promise()
      gutil.log(`Created policy ${PolicyName}`)
      if (accountName !== devsOwnAccountName()) {
        const GroupName = extractGroupName(accountName, { stage })
        try {
          await iam.createGroup({
            Path: iamPath,
            GroupName,
          }).promise()
          gutil.log(`Created group ${GroupName}`)
        } catch (e) {
          if (e.code !== 'EntityAlreadyExists') {
            throw e
          }
          gutil.log(`Group ${GroupName} already exists`)
        }
        await iam.attachGroupPolicy({
          PolicyArn: createPolicyResult.Policy.Arn,
          GroupName,
        }).promise()
        gutil.log('Attached policy to group')
      }
    }

    gulp.task(`create:aws-account:${stage}`, async () => {
      const validNames = accountNameCombinations({ proj, stage })
      const name = yargs
        .describe('name', 'The name of the AWS account')
        .choices('name', validNames)
        .demandOption(['name'])
        .argv
        .name
      // TODO: create account
      // TODO: wait for account in correct state
      // TODO: await createAccountIam(name, id)
    })

    gulp.task(`create:aws-account:iam:${stage}`, async () => {
      const account = await resolveAccount({ proj, stage })
      await createAccountIam(account.Name, account.Id)
    })

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
      const account = await resolveAccount({ proj, stage })
      yargs.usage(`Grant an ops user full access to the ${account.Name} AWS account`)
      const UserName = opsUserName()
      const iam = iamFactory()
      await iam.attachUserPolicy({
        PolicyArn: accessSourcePolicyArn(account.Name),
        UserName,
      }).promise()
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
          Destination: `https://${region}.console.aws.amazon.com/console/home?region=${region}#`,
          SigninToken: federation.SigninToken,
          SessionDuration: 12 * 60 * 60,  // Max 12 hours
        })}`,
        { wait: false },
      )
    })

  })

}
