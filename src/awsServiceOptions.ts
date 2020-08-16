import { Credentials } from 'aws-sdk'
import {
  IOptions as ICredentialsOptions,
  projCredentialsFactory,
} from './internal/awsProjCredentials'

interface IOptions extends ICredentialsOptions {
  region: string
}

export interface IServiceOpts {
  credentials: Credentials
  region: string
}

export default (options: IOptions): IServiceOpts => ({
  credentials: projCredentialsFactory(options),
  region: options.region,
})
