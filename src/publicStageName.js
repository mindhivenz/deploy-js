import devName from './devName'


export default stage =>
  stage === 'dev' ? `dev-${devName().toLowerCase()}` : stage
