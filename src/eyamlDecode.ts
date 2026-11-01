import { KMS } from 'aws-sdk'
import PluginError from 'plugin-error'
import { master } from './internal/awsMasterCredentials'

const pluginName = '@mindhivenz/deploy/eyamlDecode'

export const ENC_PATTERN = /^ENC\[KMS,([\s\S]*)]$/

export interface IOptions {
  region: string
}

// Accepts either a whole ENC[KMS,...] token or the bare base64 ciphertext
export default async (encoded: string, { region }: IOptions) => {
  let cipher = encoded.trim()
  if (cipher.startsWith('ENC[')) {
    const match = cipher.match(ENC_PATTERN)
    if (!match || !match[1]) {
      throw new PluginError(pluginName, 'Encoded string did not match format')
    }
    cipher = match[1]
  }
  const kms = new KMS({
    credentials: master,
    region,
  })
  const decryptResult = await kms
    .decrypt({
      CiphertextBlob: Buffer.from(cipher.replace(/\s/g, ''), 'base64'),
    })
    .promise()
  return (decryptResult.Plaintext as Buffer).toString()
}
