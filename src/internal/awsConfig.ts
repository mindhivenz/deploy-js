import AWS from 'aws-sdk'
import https from 'https'

const agent = new https.Agent({
  keepAlive: true,
})

const nearestRegion = process.env.NEAREST_REGION

AWS.config.update({
  httpOptions: {
    // See https://github.com/aws/aws-sdk-js/issues/2571
    agent,
  },
  ...(nearestRegion && {
    stsRegionalEndpoints: 'regional',
    sts: { region: nearestRegion },
  }),
})
