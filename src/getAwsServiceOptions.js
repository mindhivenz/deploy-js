

const getCredentials = ({ proj, stage }) => {
  const AWS = require('AWS')  // eslint-disable-line
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
