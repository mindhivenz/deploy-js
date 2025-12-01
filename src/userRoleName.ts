import { accessTargetRoleName } from './internal/awsAccounts'

export const userRoleName = process.env.MHD_ROLE_NAME ?? accessTargetRoleName
