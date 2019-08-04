import { config } from 'aws-sdk/global'
import https from 'https'

const agent = new https.Agent({
  keepAlive: true,
})

config.update({
  httpOptions: {
    // See https://github.com/aws/aws-sdk-js/issues/2571
    agent,
  },
})

const region = process.env.AWS_DEFAULT_REGION

if (region) {
  config.update({
    region,
    sts: {
      endpoint: `https://sts.${region}.amazonaws.com/`,
    },
  })
}
