import { green, yellow } from 'ansi-colors'
import { SSM } from 'aws-sdk'
import { addDays } from 'date-fns'
import log from 'fancy-log'
import { task } from 'gulp'
import awsServiceOptions from './awsServiceOptions'
import eyamlEncode, { IOptions as EyamlOptions } from './eyamlEncode'
import { highlight } from './colors'
import { globalArgs, parseArgs } from './internal/args'
import { nodeRoleName } from './nodeRoleNames'
import { PRODUCTION } from './stages'

// REVISIT: move eyaml options to be a component of this, so ssm region is obviously separate from eyaml key
interface IOptions extends EyamlOptions {
  customers: string[]
  stages?: string[]
}

export default ({
  proj,
  region,
  customers,
  stages = [PRODUCTION],
}: IOptions) => {
  stages.forEach((stage) => {
    customers.forEach((customer) => {
      const baseTaskName = `generate:ssm-activation:${customer}`
      const taskName =
        stage === PRODUCTION ? baseTaskName : `${baseTaskName}:${stage}`
      const generateActivation = async () => {
        const { region: overrideRegion } = parseArgs(
          globalArgs.option('region', {
            type: 'string',
          }),
        )
        const ssmRegion = overrideRegion || region
        const ssm = new SSM(
          awsServiceOptions({ proj, stage, region: ssmRegion }),
        )
        const expiryDate = addDays(new Date(), 7)
        const activationResult = await ssm
          .createActivation({
            ExpirationDate: expiryDate,
            IamRole: nodeRoleName(customer),
            RegistrationLimit: 10,
          })
          .promise()
        const code = activationResult.ActivationCode!
        const encodedCode = await eyamlEncode(code, { proj, region })
        log(
          [
            `Add the following to ${highlight(
              `${proj}-control`,
            )} data for ${highlight(customer)}:`,
            green(
              `# This activation is valid until ${expiryDate.toUTCString()}, regenerate with:`,
            ),
            green(`# mhd ${taskName}`),
            `${yellow('hybrid_ssm_agent::activation')}:`,
            `  ${yellow('id')}: ${activationResult.ActivationId}`,
            `  ${yellow('code')}: ${encodedCode}`,
            `${yellow('hybrid_ssm_agent::region')}: ${ssmRegion}`,
          ].join('\n'),
        )
      }
      task(`${baseTaskName}:${stage}`, generateActivation)
      if (stage === PRODUCTION) {
        task(baseTaskName, generateActivation)
      }
    })
  })
}
