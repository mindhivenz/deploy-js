

const getCredentials = ({ proj, stage }) => {
  const AWS = require('aws-sdk/global')  // eslint-disable-line
  return new AWS.SharedIniFileCredentials({ profile: stage === 'dev' ? undefined : `${proj}-${stage}` })
}

export default ({
  proj,
  stage,
  region,
}) => ({
  credentials: getCredentials({ proj, stage }),
  region,
})
