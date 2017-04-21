

export const awsCredentialsProfile = ({ proj, stage }) =>
  stage === 'dev' ? undefined : `${proj}-${stage}`

const getCredentials = (profile) => {
  const AWS = require('aws-sdk/global')  // eslint-disable-line
  return new AWS.SharedIniFileCredentials(profile)
}

export default ({
  proj,
  stage,
  region,
}) => ({
  credentials: getCredentials(awsCredentialsProfile({ proj, stage })),
  region,
})
