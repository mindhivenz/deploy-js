"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDatadogIntegration = void 0;
const aws_sdk_1 = require("aws-sdk");
const plugin_error_1 = __importDefault(require("plugin-error"));
const awsServiceOptions_1 = __importDefault(require("./awsServiceOptions"));
const updateDatadogIntegration = async ({ serviceOpts, stackName = 'datadog', cloudSecurityPostureManagement = false, externalId, ddApiKeySecretArn, }) => {
    const cloudFormation = new aws_sdk_1.CloudFormation(serviceOpts);
    try {
        await cloudFormation.describeStacks({ StackName: stackName }).promise();
    }
    catch (e) {
        if (e.code !== 'ValidationError') {
            throw e;
        }
        throw new plugin_error_1.default('updateDatadogIntegration', 'You need to manually create the stack first: https://app.datadoghq.com/account/settings#integrations/amazon-web-services');
    }
    await cloudFormation
        .updateStack({
        StackName: stackName,
        TemplateURL: 'https://datadog-cloudformation-template.s3.amazonaws.com/aws/main.yaml',
        Parameters: [
            {
                ParameterKey: 'ExternalId',
                ...(externalId
                    ? { ParameterValue: externalId }
                    : { UsePreviousValue: true }),
            },
            ...(ddApiKeySecretArn
                ? [
                    {
                        ParameterKey: 'DdApiKeySecretArn',
                        ParameterValue: ddApiKeySecretArn,
                    },
                ]
                : [{ ParameterKey: 'DdApiKey', UsePreviousValue: true }]),
            {
                ParameterKey: 'IAMRoleName',
                ParameterValue: 'DatadogIntegrationRole',
            },
            {
                ParameterKey: 'CloudSecurityPostureManagementPermissions',
                ParameterValue: cloudSecurityPostureManagement ? 'true' : 'false',
            },
        ],
        Capabilities: ['CAPABILITY_NAMED_IAM', 'CAPABILITY_AUTO_EXPAND'],
    })
        .promise();
};
exports.updateDatadogIntegration = updateDatadogIntegration;
exports.default = ({ stackName, cloudSecurityPostureManagement, externalId, ddApiKeySecretArn, ...projOpts }) => async () => {
    await (0, exports.updateDatadogIntegration)({
        stackName,
        cloudSecurityPostureManagement,
        externalId,
        ddApiKeySecretArn,
        serviceOpts: (0, awsServiceOptions_1.default)(projOpts),
    });
};
