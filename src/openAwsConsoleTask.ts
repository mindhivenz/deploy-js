import open from 'open'
import querystring from 'querystring'
import request from 'request-promise-native'
import { URL } from 'url'
import { projCredentialsFactory } from './internal/awsProjCredentials'
import { MAX_SESSION_SECONDS } from './internal/awsSession'

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
  const credentials = projCredentialsFactory({
    fullDurationSession: true,
    proj,
    stage,
  })
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
  await open(
    `https://signin.aws.amazon.com/federation?${querystring.stringify({
      Action: 'login',
      Destination: destinationUrl.href,
      Issuer: '',
      SessionDuration: MAX_SESSION_SECONDS,
      SigninToken: federation.SigninToken,
    })}`,
  )
}
