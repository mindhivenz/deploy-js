import { proj as credentialsFactory } from './awsCredentials'


export const awsCredentialsProfile = ({ proj, stage }) =>
  stage === 'dev' ? 'default' : `${proj}-${stage}`

export default ({ proj, stage, region }) => ({
  credentials: credentialsFactory({ proj, stage }),
  region,
})
