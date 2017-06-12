import gutil from 'gulp-util'
import Credstash from 'nodecredstash'
import streamToPromise from 'stream-to-promise'
import once from 'lodash/once'

import { awsOpts } from './awsAccounts'
import publicStageName from './publicStageName'


export const allStages = 'all'

const secretStash = once(() =>
  new Credstash({
    table: 'deploy-secrets',
    kmsKey: 'alias/deploy-secrets',
    awsOpts,
  })
)

const secretStageName = stage => stage ? publicStageName(stage) : allStages
const secretFqn = ({ name, proj, stage }) => [proj, secretStageName(stage), name].join('.')
const secretContext = ({ proj, stage }) => ({ proj, stage: secretStageName(stage) })

const secretsPluginName = '@mindhive/deploy/secrets'

export const getSecretText = async (ref) => {
  const name = secretFqn(ref)
  try {
    return await secretStash().getSecret({
      name,
      context: secretContext(ref),
    })
  } catch (e) {
    throw new gutil.PluginError(secretsPluginName,
      `Unable to get secret ${name}, have you been granted access to secrets for this project/stage?\n${e}`
    )
  }
}

export const getSecretJson = async ref => JSON.parse(await getSecretText(ref))

export const setSecretText = async (ref, secret) => {
  const name = secretFqn(ref)
  const currentVersion = await secretStash().getHighestVersion({ name })
  try {
    if (currentVersion) {
      const existingSecret = await await secretStash().getSecret({
        name,
        context: secretContext(ref),
      })
      if (existingSecret === secret) {
        return
      }
    }
    await secretStash().putSecret({
      name,
      version: await secretStash().incrementVersion({ name }),
      secret,
      context: secretContext(ref),
    })
  } catch (e) {
    throw new gutil.PluginError(secretsPluginName,
      `Unable to set secret ${name}, have you been granted access to secrets for this project/stage?\n${e}`
    )
  }
}

export const setSecretJson = async (ref, secretObj) => {
  await setSecretText(ref, JSON.stringify(secretObj))
}

export const readStdInSecretText = async () => {
  if (process.stdin.isTTY) {
    throw new gutil.PluginError(secretsPluginName,
      'You must pipe the input. Example: cat secretfile.json | yarn gulp -- set:secret:something',
    )
  }
  const buffer = await streamToPromise(process.stdin)
  return buffer.toString().trim()
}

export const readStdInSecretJson = async () =>
  JSON.parse(await readStdInSecretText())
