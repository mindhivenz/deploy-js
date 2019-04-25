import { config } from 'aws-sdk/global'
import https from 'https'

// See https://github.com/aws/aws-sdk-js/issues/2571

const agent = new https.Agent({
  keepAlive: true,
})

config.update({
  httpOptions: {
    agent,
  },
})
