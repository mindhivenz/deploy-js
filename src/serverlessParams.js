import publicStageName from './publicStageName'
import { awsCredentialsProfile } from './awsServiceOptions'


export default ({ proj, stage }) => {
  // use '--stageLocal' so doesn't interfere with serverless option '--stage' which should have the value of stagePublic
  const credentialsProfile = awsCredentialsProfile({ proj, stage })
  return [
    `--stageLocal ${stage}`,
    `--stagePublic ${publicStageName(stage)}`,
    ...(credentialsProfile ? [`--credentialsProfile ${credentialsProfile}`] : []),
  ].join(' ')
}
