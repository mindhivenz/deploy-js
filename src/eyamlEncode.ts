import { KMS } from 'aws-sdk'
import { master } from './internal/awsMasterCredentials'

export interface IOptions {
  proj: string
  region: string
}

export default async (secret: string, { proj, region }: IOptions) => {
  const kms = new KMS({
    credentials: master,
    region,
  })
  const encryptResult = await kms
    .encrypt({
      KeyId: `alias/${proj}-control`,
      Plaintext: secret,
    })
    .promise()
  const encoded = Buffer.from(encryptResult.CiphertextBlob!).toString('base64')
  return `ENC[KMS,${encoded}]`
}
