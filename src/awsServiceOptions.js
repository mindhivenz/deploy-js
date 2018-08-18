import { proj as credentialsFactory } from './awsCredentials'

export default ({ proj, stage, region }) => ({
  credentials: credentialsFactory({ proj, stage }),
  region,
})
