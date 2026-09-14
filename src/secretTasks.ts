import log from 'fancy-log'
import { task } from 'gulp'
import pLimit from 'p-limit'
import { prompt } from 'prompts'
import sortBy from 'lodash/sortBy'
import {
  findControlSecrets,
  FILTER_NAMES,
  IControlSecret,
  IControlSecretFilters,
  scopeName,
} from './controlSecrets'
import eyamlEncode, { IOptions } from './eyamlEncode'
import eyamlDecode from './eyamlDecode'
import { globalArgs, parseArgs } from './internal/args'
import { dim, highlight, toCopy } from './colors'
import { readStdInOrPromptText, readStdInSecretText } from './secrets'

const DECRYPT_CONCURRENCY = 10

const filterGroup = 'Filter options'

const filterArgs = () =>
  globalArgs
    .option('customer', {
      alias: 'c',
      describe: 'Customer, eg jbs',
      type: 'string',
      group: filterGroup,
    })
    .option('site', {
      alias: 's',
      describe: 'Site, eg cactus',
      type: 'string',
      group: filterGroup,
    })
    .option('host', {
      describe: 'Host, eg display1',
      type: 'string',
      group: filterGroup,
    })
    .option('key', {
      alias: 'k',
      describe: 'Hiera key, eg root_password',
      type: 'string',
      group: filterGroup,
    })
    .option('file', {
      alias: 'f',
      describe: 'File path, eg jbs/cactus',
      type: 'string',
      group: filterGroup,
    })

const filtersFrom = (args: IControlSecretFilters): IControlSecretFilters =>
  Object.fromEntries(FILTER_NAMES.map((name) => [name, args[name]]))

const logRows = (
  rows: { scope: string; key: string; value: string }[],
  valueColor: (value: string) => string,
) => {
  const scopeWidth = Math.max(...rows.map(({ scope }) => scope.length))
  const keyWidth = Math.max(...rows.map(({ key }) => key.length))
  rows.forEach(({ scope, key, value }) => {
    log(
      `${highlight(scope.padEnd(scopeWidth))}  ${key.padEnd(
        keyWidth,
      )}  ${valueColor(value)}`,
    )
  })
}

const selectSecret = async (secrets: IControlSecret[]) => {
  const choices = sortBy(
    secrets.map((secret, value) => ({
      title: `${scopeName(secret)}  ${secret.key}`,
      value,
    })),
    'title',
  )
  const answer = await prompt({
    type: 'autocomplete',
    name: 'index',
    message: 'Select secret to decrypt',
    choices,
  })
  return answer.index === undefined ? undefined : secrets[answer.index]
}

export default (options: IOptions) => {
  const { region } = options

  task('encrypt:secret:control', async () => {
    const raw = await readStdInSecretText()
    const encoded = await eyamlEncode(raw, options)
    log('Token for use in eyaml:\n' + toCopy(encoded))
  })

  task('decrypt:secret', async () => {
    const input = await readStdInOrPromptText({
      prompt: "Encoded secret (starts with 'ENC[')",
    })
    log('Decrypted secret:\n' + toCopy(await eyamlDecode(input, { region })))
  })

  task('list:secrets:control', async () => {
    const filters = filtersFrom(parseArgs(filterArgs()))
    const secrets = await findControlSecrets(filters)
    logRows(
      secrets.map((secret) => ({
        scope: scopeName(secret),
        key: secret.key,
        value: secret.file,
      })),
      dim,
    )
    log(`${secrets.length} encrypted secret(s)`)
  })

  task('decrypt:secret:control', async () => {
    const args = parseArgs(
      filterArgs().option('all', {
        describe: 'Decrypt every match instead of selecting one',
        type: 'boolean',
      }),
    )
    const secrets = await findControlSecrets(filtersFrom(args))
    let selected = secrets
    if (secrets.length > 1 && !args.all) {
      const chosen = await selectSecret(secrets)
      if (!chosen) {
        return
      }
      selected = [chosen]
    }
    const limit = pLimit(DECRYPT_CONCURRENCY)
    const rows = await Promise.all(
      selected.map((secret) =>
        limit(async () => ({
          scope: scopeName(secret),
          key: secret.key,
          value: await eyamlDecode(secret.cipher, { region }),
        })),
      ),
    )
    logRows(rows, toCopy)
  })
}
