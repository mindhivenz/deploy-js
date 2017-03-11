import getDevName from './getDevName'


export default stage =>
  stage === 'dev' ? `dev-${getDevName().toLowerCase()}` : stage
