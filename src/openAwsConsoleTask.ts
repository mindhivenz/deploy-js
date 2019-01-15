import opn from 'opn'
import querystring from 'querystring'
import request from 'request-promise-native'
import { URL } from 'url'
import { projCredentialsFactory } from './internal/awsCredentials'

interface IOptions {
  proj: string
  stage: string
  region: string
  urlParts?: Partial<URL>
}

export default ({
  proj,
  stage,
  region,
  urlParts = {},
}: IOptions) => async () => {
  const credentials = projCredentialsFactory({ proj, stage })
  await credentials.getPromise()
  const tempCredentials = {
    sessionId: credentials.accessKeyId,
    sessionKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken,
  }
  const federation = await request({
    json: true,
    qs: {
      Action: 'getSigninToken',
      Session: JSON.stringify(tempCredentials),
    },
    url: 'https://signin.aws.amazon.com/federation',
  })
  const destinationUrl = new URL(
    `https://${region}.console.aws.amazon.com/console/home?region=${region}#`,
  )
  Object.assign(destinationUrl, urlParts)
  await opn(
    `https://signin.aws.amazon.com/federation?${querystring.stringify({
      Action: 'login',
      Destination: destinationUrl.href,
      Issuer: '',
      SessionDuration: 12 * 60 * 60, // Max 12 hours,
      SigninToken: federation.SigninToken,
    })}`,
    { wait: false },
  )
}
