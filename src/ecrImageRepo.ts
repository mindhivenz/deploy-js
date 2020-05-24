import { IOptions as IEcrOptions, repoHost } from './internal/ecr'

interface IOptions extends IEcrOptions {
  name: string
}

export default async (options: IOptions) => {
  const host = await repoHost(options)
  return `${host}/${options.name}`
}
