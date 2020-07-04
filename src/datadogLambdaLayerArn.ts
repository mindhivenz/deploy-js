import { Runtime } from '@aws-cdk/aws-lambda'

export default (region: string, runtime: Runtime): string => {
  if (runtime.runtimeEquals(Runtime.NODEJS_12_X)) {
    return `arn:aws:lambda:${region}:464622532012:layer:Datadog-Node12-x:24`
  }
  throw new Error(`No layer set for runtime ${runtime}`)
}
