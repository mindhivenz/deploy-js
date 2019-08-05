import yargs from 'yargs'

export const globalArgs = yargs
  .option('verbose', {
    describe: 'Stream all sub-process output to console',
  })
  .option('devName', {
    describe: "Override your 'dev' name, defaults to your git username",
  })
