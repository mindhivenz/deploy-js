import defaultDevName from './devName'


export default (stage, devName = defaultDevName()) =>
  stage === 'dev' ? `dev-${devName}` : stage
