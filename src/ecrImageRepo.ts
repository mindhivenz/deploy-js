import { IRepoHostOptions, repoHost } from './internal/ecr'

interface IOptions extends IRepoHostOptions {
  name: string
}

export default async (options: IOptions) => {
  const host = await repoHost(options)
  return `${host}/${options.name}`
}
