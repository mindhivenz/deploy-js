import publicStageName from './publicStageName'
import { awsCredentialsProfile } from './awsServiceOptions'


export default ({ proj, stage }) =>
  // use '--stageLocal' so doesn't interfere with serverless option '--stage' which should have the value of stagePublic
  `--stageLocal ${stage} --stagePublic ${publicStageName(stage)} ` +
  `--credentialsProfile ${awsCredentialsProfile({ proj, stage })}`
