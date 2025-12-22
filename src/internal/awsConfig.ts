import AWS from 'aws-sdk'
import https from 'https'

const agent = new https.Agent({
  keepAlive: true,
})

AWS.config.update({
  httpOptions: {
    // See https://github.com/aws/aws-sdk-js/issues/2571
    // Should not be needed with AWS SDK v3
    agent,
  },
})
