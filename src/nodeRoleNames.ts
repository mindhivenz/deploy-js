export const nodeRoleName = (customer: string) => `node@${customer}`

export const nodeRoleArn = (accountId: string, customer: string) =>
  `arn:aws:iam::${accountId}:role/${nodeRoleName(customer)}`
