import getStdin from 'get-stdin'
import once from 'lodash/once'
import Credstash from 'nodecredstash'
import PluginError from 'plugin-error'
import { prompt } from 'prompts'
import { master } from './internal/awsMasterCredentials'
import publicStageName from './publicStageName'

export const allStages = 'all'

const secretStash = once(() =>
  Credstash({
    awsOpts: {
      credentials: master,
      region: 'us-east-1',
    },
    kmsKey: 'alias/deploy-secrets',
    table: 'deploy-secrets',
  }),
)

interface ISecretContext {
  proj: string
  stage?: string
}

export interface ISecretRef extends ISecretContext {
  name: string
}

const secretStageName = (stage?: string) =>
  stage ? publicStageName(stage) : allStages
const secretFqn = ({ name, proj, stage }: ISecretRef) =>
  [proj, secretStageName(stage), name].join('.')
const secretContext = ({ proj, stage }: ISecretContext) => ({
  proj,
  stage: secretStageName(stage),
})

const secretsPluginName = '@mindhivenz/deploy/secrets'

export const getSecretText = async (ref: ISecretRef) => {
  const name = secretFqn(ref)
  try {
    return await secretStash().getSecret({
      context: secretContext(ref),
      name,
    })
  } catch (e) {
    throw new PluginError(
      secretsPluginName,
      `Unable to get secret ${name}, have you been granted access to secrets for this project/stage?\n${e}`,
    )
  }
}

export const getSecretJson = async (ref: ISecretRef) =>
  JSON.parse(await getSecretText(ref))

export const setSecretText = async (ref: ISecretRef, secret: string) => {
  const name = secretFqn(ref)
  const currentVersion = await secretStash().getHighestVersion({ name })
  try {
    if (currentVersion) {
      const existingSecret = await await secretStash().getSecret({
        context: secretContext(ref),
        name,
      })
      if (existingSecret === secret) {
        return
      }
    }
    await secretStash().putSecret({
      context: secretContext(ref),
      name,
      secret,
      version: (await secretStash().incrementVersion({
        name,
      })) as any as number,
    })
  } catch (e) {
    throw new PluginError(
      secretsPluginName,
      `Unable to set secret ${name}, have you been granted access to secrets for this project/stage?\n${e}`,
    )
  }
}

export const setSecretJson = async (ref: ISecretRef, secretObj: object) => {
  await setSecretText(ref, JSON.stringify(secretObj))
}

interface ReadStdInOrPromptTextOpts {
  prompt: string
}

export const readStdInOrPromptText = async ({
  prompt: message,
}: ReadStdInOrPromptTextOpts): Promise<string> => {
  const raw = await getStdin()
  if (raw) {
    return raw.trim()
  }
  const answer = await prompt({
    type: 'text',
    name: 'raw',
    message,
  })
  return answer.raw as string
}

export const readStdInSecretText = async (): Promise<string> => {
  const raw = await getStdin()
  if (raw) {
    return raw.trim()
  }
  const answer = await prompt({
    type: 'password',
    name: 'raw',
    message: 'Type/paste secret',
  })
  return answer.raw as string
}

export const readStdInSecretJson = async () => {
  const raw = await getStdin()
  return JSON.parse(raw)
}
