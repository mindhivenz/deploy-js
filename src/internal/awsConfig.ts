import AWS from 'aws-sdk'
import https from 'https'

const agent = new https.Agent({
  keepAlive: true,
})

AWS.config.update({
  httpOptions: {
    // See https://github.com/aws/aws-sdk-js/issues/2571
    agent,
  },
})

const region = process.env.AWS_DEFAULT_REGION

if (region) {
  AWS.config.update({
    region,
    sts: {
      endpoint: `https://sts.${region}.amazonaws.com/`,
    },
    stsRegionalEndpoints: 'regional',
  })
}
