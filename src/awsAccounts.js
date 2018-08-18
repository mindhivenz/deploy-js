import Organizations from 'aws-sdk/clients/organizations'
import range from 'lodash/range'
import PluginError from 'plugin-error'

import { master } from './awsCredentials'
import publicStageName from './publicStageName'

const pluginName = '@mindhive/deploy/awsAccounts'

export const awsMasterOpts = {
  credentials: master,
  region: 'us-east-1',
}

const orgsFactory = () =>
  new Organizations({ apiVersion: '2016-11-28', ...awsMasterOpts })

const groupNameCombinations = ({ proj }) => {
  const projParts = proj.split('-')
  return range(projParts.length, 0, -1).map(i =>
    projParts.slice(0, i).join('-'),
  )
}

export const devsOwnAccountName = devName => publicStageName('dev', devName)

const accountNameCombinations = ({ proj, stage }) => {
  const stagePublic = publicStageName(stage)
  const result = groupNameCombinations({ proj }).map(g => `${g}-${stagePublic}`)
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
  if (!account) {
    throw new PluginError(
      pluginName,
      `Couldn't match linked account. Searched: ${JSON.stringify(
        namePrecedence,
      )}. Check AWS Organizations.`,
    )
  }
  return account
}

export const accessTargetRoleArn = accountId =>
  `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`
