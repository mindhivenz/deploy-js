import fs from 'fs'
import yaml from 'js-yaml'
import sortBy from 'lodash/sortBy'
import uniq from 'lodash/uniq'
import path from 'path'
import PluginError from 'plugin-error'
import execFile from './execFile'
import { ENC_PATTERN } from './eyamlDecode'

const pluginName = '@mindhivenz/deploy/controlSecrets'

export interface IControlSecret {
  customer: string
  site: string
  host: string
  key: string
  cipher: string
  file: string
}

export interface IControlSecretFilters {
  customer?: string
  site?: string
  host?: string
  key?: string
  file?: string
}

export const FILTER_NAMES: (keyof IControlSecretFilters)[] = [
  'customer',
  'site',
  'host',
  'key',
  'file',
]

export const scopeName = ({ customer, site, host }: IControlSecret) =>
  [customer, site, host].filter(Boolean).join('/') || 'common'

// Control repos are the project repo with a -control suffix, as mhd resolves them
export const controlRepoDir = async (cwd: string = process.cwd()) => {
  const { stdOut } = await execFile('git', ['rev-parse', '--show-toplevel'], {
    cwd,
    captureOutput: true,
  })
  const repoDir = stdOut.trim()
  return repoDir.endsWith('-control') ? repoDir : `${repoDir}-control`
}

const yamlFiles = (dir: string): string[] =>
  sortBy(fs.readdirSync(dir, { withFileTypes: true }), 'name').flatMap(
    (entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return yamlFiles(full)
      }
      return entry.name.endsWith('.yaml') ? [full] : []
    },
  )

// Hiera hierarchy: common.yaml, <customer>/(common|<site>).yaml, <customer>/<site>/<host>.yaml
const scopeOf = (relFile: string) => {
  const segments = relFile.split(path.sep)
  const name = path.basename(segments[segments.length - 1], '.yaml')
  if (segments.length === 1) {
    return { customer: '', site: '', host: '' }
  }
  if (segments.length === 2) {
    return {
      customer: segments[0],
      site: name === 'common' ? '' : name,
      host: '',
    }
  }
  return { customer: segments[0], site: segments[1], host: name }
}

const encryptedIn = (node: unknown, keyPath: string[] = []): IControlSecret[] => {
  if (typeof node === 'string') {
    return ENC_PATTERN.test(node.trim())
      ? ([{ key: keyPath.join('.'), cipher: node.trim() }] as IControlSecret[])
      : []
  }
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => encryptedIn(item, [...keyPath, `${i}`]))
  }
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) =>
      encryptedIn(value, [...keyPath, key]),
    )
  }
  return []
}

export const controlSecrets = async (
  controlDir?: string,
): Promise<IControlSecret[]> => {
  const dataDir = path.join(controlDir || (await controlRepoDir()), 'data')
  if (!fs.existsSync(dataDir)) {
    throw new PluginError(
      pluginName,
      `Hiera data not found at ${dataDir}, is the control repo cloned alongside this project?`,
    )
  }
  return yamlFiles(dataDir).flatMap((file) => {
    const relFile = path.relative(dataDir, file)
    const scope = scopeOf(relFile)
    return encryptedIn(yaml.load(fs.readFileSync(file, 'utf8'))).map(
      (secret) => ({
        ...secret,
        ...scope,
        file: path.join('data', relFile),
      }),
    )
  })
}

const contains = (value: string, filter?: string) =>
  !filter || value.toLowerCase().includes(filter.toLowerCase())

export const describeFilters = (filters: IControlSecretFilters) => {
  const applied = FILTER_NAMES.filter((name) => filters[name]).map(
    (name) => `--${name}=${filters[name]}`,
  )
  return applied.length ? applied.join(' ') : 'no filters'
}

// Every filter is a case insensitive substring match, so partial names work
export const findControlSecrets = async (
  filters: IControlSecretFilters,
  controlDir?: string,
): Promise<IControlSecret[]> => {
  const available = await controlSecrets(controlDir)
  const matched = available.filter(
    (secret) =>
      contains(secret.customer, filters.customer) &&
      contains(secret.site, filters.site) &&
      contains(secret.host, filters.host) &&
      contains(secret.key, filters.key) &&
      contains(secret.file, filters.file),
  )
  if (!matched.length) {
    const customers = uniq(
      available.map(({ customer }) => customer || 'common'),
    )
    const sites = uniq(
      available
        .filter(({ customer }) => contains(customer, filters.customer))
        .map(({ site }) => site)
        .filter(Boolean),
    )
    throw new PluginError(
      pluginName,
      `No encrypted secrets match ${describeFilters(filters)}\n` +
        `Customers: ${sortBy(customers).join(', ')}\n` +
        `Sites: ${sortBy(sites).join(', ') || '<none>'}`,
    )
  }
  return sortBy(matched, ['customer', 'site', 'host', 'key'])
}
