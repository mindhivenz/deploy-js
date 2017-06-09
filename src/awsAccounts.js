import Organizations from 'aws-sdk/clients/organizations'
import range from 'lodash/range'
import gutil from 'gulp-util'

import { master } from './awsCredentials'
import publicStageName from './publicStageName'


const pluginName = '@mindhive/deploy/awsAccounts'

export const resolve = async ({ proj, stage }) => {
  const orgs = new Organizations({ apiVersion: '2016-11-28', credentials: master, region: 'us-east-1' })
  const orgListResult = await orgs.listAccounts().promise()
  if (orgListResult.NextToken) {
    throw new Error('Not implemented yet: handling paginated results')
  }
  const projParts = proj.split('-')
  const stagePublic = publicStageName(stage)
  const accountNamePrecedence = [
    ...range(projParts.length, 0, -1)
      .map(i => `${projParts.slice(0, i).join('-')}-${stagePublic}`),
    ...(stage === 'dev' ? [stagePublic] : []),
  ]
  const account = accountNamePrecedence
    .map(name => orgListResult.Accounts.find(a => a.Name === name))
    .find(Boolean)
  if (! account) {
    throw new gutil.PluginError(
      pluginName,
      `Couldn't match linked account. Searched: ${JSON.stringify(accountNamePrecedence)}. Check AWS Organizations.`,
    )
  }
  return account
}

export const accessRoleArn = account => `arn:aws:iam::${account.Id}:role/OrganizationAccountAccessRole`
