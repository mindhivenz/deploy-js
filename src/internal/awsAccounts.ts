import AWS from 'aws-sdk'
import once from 'lodash/once'
import range from 'lodash/range'
import PluginError from 'plugin-error'
import defaultDevName from '../devName'
import publicStageName from '../publicStageName'
import { DEV_OWN_ACCOUNT_STAGE } from '../stages'
import { master } from './awsMasterCredentials'

const pluginName = '@mindhivenz/deploy/awsAccounts'
const onlyValidAwsOrganizationsRegion = 'us-east-1'

interface IOptions {
  proj: string
  stage: string
  devName?: string
}

const groupNameCombinations = (proj: string) => {
  const projParts = proj.split('-')
  return range(projParts.length, 0, -1).map((i) =>
    projParts.slice(0, i).join('-'),
  )
}

export const devsOwnAccountName = (name: string) =>
  publicStageName(DEV_OWN_ACCOUNT_STAGE, name)

const accountNameCombinations = ({ proj, stage, devName }: IOptions) => {
  const stagePublic = publicStageName(stage, devName)
  const result = groupNameCombinations(proj).map((g) => `${g}-${stagePublic}`)
  if (stage === DEV_OWN_ACCOUNT_STAGE) {
    result.push(devsOwnAccountName(devName || defaultDevName()))
  }
  return result
}

const listAccounts = once(async () => {
  const orgs = new AWS.Organizations({
    apiVersion: '2016-11-28',
    credentials: master,
    region: onlyValidAwsOrganizationsRegion,
  })
  let nextToken
  const allAccounts: AWS.Organizations.Account[] = []
  do {
    const listResult: AWS.Organizations.Types.ListAccountsResponse = await orgs
      .listAccounts({
        NextToken: nextToken,
      })
      .promise()
    if (listResult?.Accounts) {
      allAccounts.push(...listResult.Accounts)
    }
    nextToken = listResult.NextToken
  } while (nextToken)

  if (!allAccounts) {
    throw new Error('listAccounts unexpectedly did not return Accounts')
  }
  return allAccounts
})

export const resolveAccount = async (options: IOptions) => {
  const accounts = await listAccounts()
  const namePrecedence = accountNameCombinations(options)
  const account = namePrecedence
    .map((name) => accounts.find((a) => a.Name === name))
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

export const accessTargetRoleName = 'ops'

export const accessTargetRoleArn = (accountId: string, roleName: string) =>
  `arn:aws:iam::${accountId}:role/${roleName}`

const accentuateAccountName = (name: string) =>
  name.replace('production', 'PRODUCTION')

interface ISessionNameOptions {
  accountName: string
  devName?: string
  roleName?: string
}

export const accessRoleSessionName = ({
  accountName,
  devName,
  roleName,
}: ISessionNameOptions): string => {
  const parts = [
    accentuateAccountName(accountName),
    devName || defaultDevName(),
  ]
  if (roleName) {
    parts.push(roleName)
  }
  return parts.join('-')
}
