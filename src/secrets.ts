import getStdin from 'get-stdin'
import once from 'lodash/once'
import Credstash from 'nodecredstash'
import PluginError from 'plugin-error'
import { master } from './internal/awsMasterCredentials'
import { commandLine } from './internal/colors'
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

const secretsPluginName = '@mindhive/deploy/secrets'

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
      version: ((await secretStash().incrementVersion({
        name,
      })) as any) as number,
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

const EXAMPLE_TASK_NAME = 'some:task'

export const readStdInSecretText = async (taskName?: string) => {
  const raw = await getStdin()
  if (!raw) {
    throw new PluginError(
      taskName || secretsPluginName,
      `You must pipe the input. Example: ${commandLine(
        `pbpaste | mhd ${taskName || EXAMPLE_TASK_NAME}`,
      )}`,
    )
  }
  return raw.trim()
}

export const readStdInSecretJson = async () =>
  JSON.parse(await readStdInSecretText())
