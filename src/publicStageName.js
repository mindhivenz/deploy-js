import devName from './devName'


export default stage =>
  stage === 'dev' ? `dev-${devName().toLowerCase().replace(/\s+/, '-')}` : stage
