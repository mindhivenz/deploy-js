import yargs, { Argv } from 'yargs'

const ARGS_ENV_VAR = 'MHD_ARGS'
const ARG_SEPARATOR = '\t'

const group = 'Global options'

export const globalArgs = yargs
  .version(false)
  .option('verbose', {
    describe: 'Stream all sub-process output to console',
    group,
    boolean: true,
  })
  .option('devName', {
    describe: "Override your 'dev' name",
    group,
    defaultDescription: 'your git username',
    string: true,
  })
  .option('ignore-git', { describe: 'Ignore git remote', group, boolean: true })

export const parseArgs = <T>(args: Argv<T>) => {
  if (ARGS_ENV_VAR in process.env) {
    const argsEnvValue = process.env[ARGS_ENV_VAR]
    const argsEnv = argsEnvValue ? argsEnvValue.split(ARG_SEPARATOR) : []
    return args.strict(true).parseSync(argsEnv)
  } else {
    const argsProcess = process.argv.slice(2)
    return args.strict(false).parseSync(argsProcess)
  }
}
