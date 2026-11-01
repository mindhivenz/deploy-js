"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDatadogIntegration = void 0;
const aws_sdk_1 = require("aws-sdk");
const fancy_log_1 = __importDefault(require("fancy-log"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const awsServiceOptions_1 = __importDefault(require("./awsServiceOptions"));
const isNoUpdates = (e) => e.code === 'ValidationError' &&
    e.message.includes('No updates are to be performed');
const updateDatadogIntegration = async ({ serviceOpts, stackName = 'DatadogIntegration', cloudSecurityPostureManagement = false, externalId, ddApiKeyTextDoNotCommit, ddApiKeySecretArn, roleArn, }) => {
    const cloudFormation = new aws_sdk_1.CloudFormation(serviceOpts);
    try {
        await cloudFormation.describeStacks({ StackName: stackName }).promise();
    }
    catch (e) {
        if (e.code !== 'ValidationError') {
            throw e;
        }
        throw new plugin_error_1.default('updateDatadogIntegration', "It looks like you haven't created the stack yet: https://app.datadoghq.com/account/settings#integrations/amazon-web-services" +
            `, or you have the wrong stack name (expected: ${stackName})`);
    }
    try {
        await cloudFormation
            .updateStack({
            StackName: stackName,
            RoleARN: roleArn,
            TemplateURL: 'https://datadog-cloudformation-template.s3.amazonaws.com/aws/main.yaml',
            Parameters: [
                {
                    ParameterKey: 'ExternalId',
                    ...(externalId
                        ? { ParameterValue: externalId }
                        : { UsePreviousValue: true }),
                },
                ...(ddApiKeyTextDoNotCommit
                    ? [
                        {
                            ParameterKey: 'DdApiKey',
                            ParameterValue: ddApiKeyTextDoNotCommit,
                        },
                    ]
                    : ddApiKeySecretArn
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
    }
    catch (e) {
        if (!isNoUpdates(e)) {
            throw e;
        }
        (0, fancy_log_1.default)('Datadog integration already up to date');
        return;
    }
    await cloudFormation
        .waitFor('stackUpdateComplete', { StackName: stackName })
        .promise();
};
exports.updateDatadogIntegration = updateDatadogIntegration;
exports.default = ({ stackName, cloudSecurityPostureManagement, externalId, ddApiKeySecretArn, ddApiKeyTextDoNotCommit, roleArn, ...projOpts }) => async () => {
    await (0, exports.updateDatadogIntegration)({
        stackName,
        cloudSecurityPostureManagement,
        externalId,
        ddApiKeySecretArn,
        ddApiKeyTextDoNotCommit,
        roleArn,
        serviceOpts: (0, awsServiceOptions_1.default)(projOpts),
    });
};
