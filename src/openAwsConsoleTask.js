import request from 'request-promise-native'
import querystring from 'querystring'
import opn from 'opn'
import { URL } from 'url'

import { proj as credentialsFactory } from './awsCredentials'


export default ({ proj, stage, region, urlParts = {} }) =>
  async () => {
    const credentials = credentialsFactory({ proj, stage })
    await credentials.getPromise()
    const tempCredentials = {
      sessionId: credentials.accessKeyId,
      sessionKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    }
    const federation = await request({
      url: 'https://signin.aws.amazon.com/federation',
      qs: {
        Action: 'getSigninToken',
        Session: JSON.stringify(tempCredentials),
      },
      json: true,
    })
    const destinationUrl = new URL(`https://${region}.console.aws.amazon.com/console/home?region=${region}#`)
    Object.assign(destinationUrl, urlParts)
    opn(
      `https://signin.aws.amazon.com/federation?${querystring.stringify({
        Action: 'login',
        Issuer: '',
        Destination: destinationUrl.href,
        SigninToken: federation.SigninToken,
        SessionDuration: 12 * 60 * 60,  // Max 12 hours
      })}`,
      { wait: false },
    )
  }
