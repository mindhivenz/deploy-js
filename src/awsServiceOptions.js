

export const awsCredentialsProfile = ({ proj, stage }) =>
  stage === 'dev' ? undefined : `${proj}-${stage}`

const getCredentials = (profile) => {
  const AWS = require('aws-sdk/global')  // eslint-disable-line
  return new AWS.SharedIniFileCredentials({ profile })
}

export const fromProfile = ({ profile, region }) => ({
  credentials: getCredentials(profile),
  region,
})

export default ({ proj, stage, region }) =>
  fromProfile({ profile: awsCredentialsProfile({ proj, stage }), region })
