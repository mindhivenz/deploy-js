import Organizations from 'aws-sdk/clients/organizations'
import IAM from 'aws-sdk/clients/iam'
import range from 'lodash/range'
import gutil from 'gulp-util'

import { master } from './awsCredentials'
import publicStageName from './publicStageName'


const pluginName = '@mindhive/deploy/awsAccounts'

export const masterAccountId = '087916394902'

export const iamPath = '/ops/'

export const awsOpts = {
  credentials: master,
  region: 'us-east-1',
}

const orgsFactory = () => new Organizations({ apiVersion: '2016-11-28', ...awsOpts })
const iamFactory = () => new IAM({ apiVersion: '2010-05-08', ...awsOpts })

const groupNameCombinations = ({ proj }) => {
  const projParts = proj.split('-')
  return range(projParts.length, 0, -1)
    .map(i => projParts.slice(0, i).join('-'))
}

export const devsOwnAccountName = () => publicStageName('dev')

export const accountNameCombinations = ({ proj, stage }) => {
  const stagePublic = publicStageName(stage)
  const result = groupNameCombinations({ proj })
    .map(g => `${g}-${stagePublic}`)
  if (stage === 'dev') {
    result.push(devsOwnAccountName())
  }
  return result
}

export const resolveAccount = async ({ proj, stage }) => {
  const orgs = orgsFactory()
  const listResult = await orgs.listAccounts().promise()
  if (listResult.NextToken) {
    throw new Error('Not implemented yet: handling paginated results')
  }
  const namePrecedence = accountNameCombinations({ proj, stage })
  const account = namePrecedence
    .map(name => listResult.Accounts.find(a => a.Name === name))
    .find(Boolean)
  if (! account) {
    throw new gutil.PluginError(
      pluginName,
      `Couldn't match linked account. Searched: ${JSON.stringify(namePrecedence)}. Check AWS Organizations.`,
    )
  }
  return account
}

export const accessTargetRoleArn = accountId => `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`
export const accessSourcePolicyName = accountName => `FullAccess@${accountName}`
export const accessSourcePolicyArn = accountName =>
  `arn:aws:iam::${masterAccountId}:policy/${accessSourcePolicyName(accountName)}`

export const extractGroupName = (accountName, { stage }) => {
  const stagePublic = publicStageName(stage)
  if (accountName === stagePublic) {
    throw new Error(`As this account name ${accountName} is just a stage name it does not belong to a group`)
  }
  const stageSuffix = `-${stagePublic}`
  if (! accountName.endsWith(stageSuffix)) {
    throw new Error(`Expected ${accountName} to end with the public stage ${stageSuffix}`)
  }
  return accountName.slice(0, -stageSuffix.length)
}

export const resolveGroupName = async ({ proj }) => {
  const iam = iamFactory()
  const listResult = await iam.listGroups({ PathPrefix: iamPath }).promise()
  if (listResult.IsTruncated) {
    throw new Error('Not implemented yet: handling paginated results')
  }
  const namePrecedence = groupNameCombinations({ proj })
  const group = namePrecedence
    .map(name => listResult.Groups.find(g => g.GroupName === name))
    .find(Boolean)
  if (! group) {
    throw new gutil.PluginError(
      pluginName,
      `Couldn't match project ${proj} to group. Searched: ${JSON.stringify(namePrecedence)}. Check AWS IAM.`,
    )
  }
  return group.GroupName
}
