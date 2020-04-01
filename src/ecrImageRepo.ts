import { IOptions as EcrOptions, repoHost } from './internal/ecr'

interface IOptions extends EcrOptions {
  name: string
}

export default async (options: IOptions) => {
  const host = await repoHost(options)
  return `${host}/${options.name}`
}
