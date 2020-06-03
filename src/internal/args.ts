import yargs from 'yargs'

const group = 'Global options'

export const globalArgs = yargs
  .version(false)
  .option('verbose', {
    describe: 'Stream all sub-process output to console',
    group,
    string: true,
  })
  .option('devName', {
    describe: "Override your 'dev' name",
    group,
    defaultDescription: 'your git username',
  })
