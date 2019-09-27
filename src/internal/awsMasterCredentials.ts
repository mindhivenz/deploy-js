import AWS from 'aws-sdk'

// Only use credentials from the env so they are not being stored unencrypted in the standard ini file
export const master = new AWS.EnvironmentCredentials('AWS')

export const masterIsRole = async (): Promise<boolean> => {
  await master.getPromise()
  return !!master.sessionToken
}
