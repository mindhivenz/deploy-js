import { master } from './internal/awsMasterCredentials'

interface IOptions {
  region: string
}

export default (options: IOptions) => ({
  credentials: master,
  region: options.region,
})
