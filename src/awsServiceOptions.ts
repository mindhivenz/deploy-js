import {
  IOptions as ICredentialsOptions,
  projCredentialsFactory,
} from './internal/awsProjCredentials'

interface IOptions extends ICredentialsOptions {
  region: string
}

export default (options: IOptions) => ({
  credentials: projCredentialsFactory(options),
  region: options.region,
})
