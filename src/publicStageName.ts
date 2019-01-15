import defaultDevName from './devName'


export default (stage: string, devName = defaultDevName()) =>
  stage === 'dev' ? `dev-${devName}` : stage
