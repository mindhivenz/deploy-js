import open from 'open'
import PluginError from 'plugin-error'
import querystring from 'querystring'
import fetch from 'node-fetch'
import { URL } from 'url'
import { projCredentialsFactory } from './awsProjCredentials'
import { MAX_SESSION_SECONDS } from './awsSession'

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
  const federationResponse = await fetch(
    `https://signin.aws.amazon.com/federation?${querystring.stringify({
      Action: 'getSigninToken',
      Session: JSON.stringify(tempCredentials),
    })}`,
  )
  if (!federationResponse.ok) {
    throw new PluginError(
      'openAwsConsoleTask',
      `Failed getting signin token: ${federationResponse.statusText}`,
    )
  }
  const federationResult = await federationResponse.json()
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
      SigninToken: federationResult.SigninToken,
    })}`,
  )
}
