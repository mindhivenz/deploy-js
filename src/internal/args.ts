import yargs from 'yargs'

const group = 'Global options'

export const globalArgs = yargs
  .option('verbose', {
    describe: 'Stream all sub-process output to console',
    group,
  })
  .option('devName', {
    describe: "Override your 'dev' name, defaults to your git username",
    group,
  })
