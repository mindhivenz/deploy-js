import { KMS } from 'aws-sdk'
import log from 'fancy-log'
import { task } from 'gulp'
import PluginError from 'plugin-error'
import eyamlEncode, { IOptions } from './eyamlEncode'
import { master } from './internal/awsMasterCredentials'
import { toCopy } from './colors'
import { readStdInOrPromptText, readStdInSecretText } from './secrets'

export default (options: IOptions) => {
  task('encrypt:secret:control', async () => {
    const raw = await readStdInSecretText()
    const encoded = await eyamlEncode(raw, options)
    log('Token for use in eyaml:\n' + toCopy(encoded))
  })

  task('decrypt:secret', async () => {
    let input = await readStdInOrPromptText({
      prompt: "Encoded secret (starts with 'ENC[')",
    })
    if (input.startsWith('ENC[')) {
      const match = input.match(/^ENC\[KMS,(.*)]$/)
      if (!match || !match[1]) {
        throw new PluginError('decrypt', 'Encoded string did not match format')
      }
      input = match[1]
    }
    const { region } = options
    const kms = new KMS({
      credentials: master,
      region,
    })
    const decryptResult = await kms
      .decrypt({
        CiphertextBlob: Buffer.from(input, 'base64'),
      })
      .promise()
    const decoded = decryptResult.Plaintext as Buffer
    log('Decrypted secret:\n' + toCopy(decoded.toString()))
  })
}
