"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const awsServiceOptions_1 = __importDefault(require("./awsServiceOptions"));
const stackName = 'datadog-serverless-macro';
const stackOptions = {
    StackName: stackName,
    TemplateURL: 'https://datadog-cloudformation-template.s3.amazonaws.com/aws/serverless-macro/latest.yml',
    Capabilities: ['CAPABILITY_AUTO_EXPAND', 'CAPABILITY_IAM'],
};
exports.default = (options) => async () => {
    const cloudFormation = new aws_sdk_1.CloudFormation((0, awsServiceOptions_1.default)(options));
    let exists;
    try {
        await cloudFormation.describeStacks({ StackName: stackName }).promise();
        exists = true;
    }
    catch (e) {
        if (e.code !== 'ValidationError') {
            throw e;
        }
        exists = false;
    }
    const request = exists
        ? cloudFormation.updateStack(stackOptions)
        : cloudFormation.createStack(stackOptions);
    await request.promise();
};
// Change
