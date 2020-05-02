import { green, yellow } from 'ansi-colors'
import { SSM } from 'aws-sdk'
import { addDays } from 'date-fns'
import log from 'fancy-log'
import { task } from 'gulp'
import awsServiceOptions from './awsServiceOptions'
import eyamlEncode from './eyamlEncode'
import { highlight } from './internal/colors'
import { nodeRoleName } from './internal/sharedNames'

interface IOptions {
  proj: string
  region: string
  customers: string[]
}

export default ({ proj, region, customers }: IOptions) => {
  const stage = 'production' // REVISIT: will we activate nodes in non-production stages?
  customers.forEach((customer) => {
    const taskName = `generate:ssm-activation:${customer}`
    task(taskName, async () => {
      const ssm = new SSM(awsServiceOptions({ proj, stage, region }))
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
          `${yellow('hybrid_ssm_agent::region')}: ${region}`,
        ].join('\n'),
      )
    })
  })
}
