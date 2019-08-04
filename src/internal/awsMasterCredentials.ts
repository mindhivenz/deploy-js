// Force credentials to come from the env so they are not being stored unencrypted in the standard ini file
import AWS from 'aws-sdk/global'

export const master = new AWS.EnvironmentCredentials('AWS')
