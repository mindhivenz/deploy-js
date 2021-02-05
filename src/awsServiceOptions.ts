import { Credentials } from 'aws-sdk'
import { projCredentialsFactory } from './internal/awsProjCredentials'
import { IRegionalProjOptions } from './internal/awsProjOptions'

export interface IServiceOpts {
  credentials: Credentials
  region: string
}

export default (options: IRegionalProjOptions): IServiceOpts => ({
  credentials: projCredentialsFactory(options),
  region: options.region,
})
