import gulp from 'gulp'
import gutil from 'gulp-util'
import request from 'request-promise-native'
import querystring from 'querystring'
import opn from 'opn'

import devName from './devName'
import { proj as credentialsFactory } from './awsCredentials'


export default ({ proj, stages, region }) => {

  gulp.task('who-am-i', async () =>
    gutil.log(`You are devName: ${gutil.colors.yellow(devName())}`)
  )

  stages.forEach((stage) => {

    gulp.task(`open:aws:${stage}`, async () => {
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
      opn(
        `https://signin.aws.amazon.com/federation?${querystring.stringify({
          Action: 'login',
          Issuer: '',
          Destination: `https://${region}.console.aws.amazon.com/console/home?region=${region}#`,
          SigninToken: federation.SigninToken,
          SessionDuration: 12 * 60 * 60,  // Max 12 hours
        })}`,
        { wait: false },
      )
    })

  })

}
