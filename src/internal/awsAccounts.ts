import Organizations from 'aws-sdk/clients/organizations'
import range from 'lodash/range'
import PluginError from 'plugin-error'

import devName from '../devName'
import publicStageName from '../publicStageName'
import { master } from './awsMasterCredentials'

const pluginName = '@mindhive/deploy/awsAccounts'

interface IOptions {
  proj: string
  stage: string
}

const orgsFactory = () =>
  new Organizations({
    apiVersion: '2016-11-28',
    credentials: master,
    region: 'us-east-1',
  })

const groupNameCombinations = ({ proj }: { proj: string }) => {
  const projParts = proj.split('-')
  return range(projParts.length, 0, -1).map(i =>
    projParts.slice(0, i).join('-'),
  )
}

export const devsOwnAccountName = (name: string) => publicStageName('dev', name)

const accountNameCombinations = ({ proj, stage }: IOptions) => {
  const stagePublic = publicStageName(stage)
  const result = groupNameCombinations({ proj }).map(g => `${g}-${stagePublic}`)
  if (stage === 'dev') {
    result.push(devsOwnAccountName(devName()))
  }
  return result
}

export const resolveAccount = async ({ proj, stage }: IOptions) => {
  const orgs = orgsFactory()
  const listResult = await orgs.listAccounts().promise()
  if (listResult.NextToken) {
    throw new Error('Not implemented yet: handling paginated results')
  }
  const namePrecedence = accountNameCombinations({ proj, stage })
  const account = namePrecedence
    .map(
      name =>
        listResult.Accounts && listResult.Accounts.find(a => a.Name === name),
    )
    .find(Boolean)
  if (!account || !account.Id) {
    throw new PluginError(
      pluginName,
      `Couldn't match linked account. Searched: ${JSON.stringify(
        namePrecedence,
      )}. Check AWS Organizations.`,
    )
  }
  return account
}

export const accessTargetRoleArn = (accountId: string) =>
  `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`
