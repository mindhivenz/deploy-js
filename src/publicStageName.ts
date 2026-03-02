import defaultDevName from './devName'

import { DEV_OWN_ACCOUNT_STAGE } from './stages'

export default (stage: string, devName = defaultDevName()) =>
  stage === DEV_OWN_ACCOUNT_STAGE ? `dev-${devName}` : stage
