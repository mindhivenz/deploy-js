"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const plugin_error_1 = __importDefault(require("plugin-error"));
const awsServiceOptions_1 = __importDefault(require("./awsServiceOptions"));
const pluginName = 'getCloudFormationOutputs';
exports.default = async (names, { stackName, ...serviceOpts }) => {
    const cloudFormation = new aws_sdk_1.CloudFormation((0, awsServiceOptions_1.default)(serviceOpts));
    const outputs = {};
    if (stackName) {
        const stackResult = await cloudFormation
            .describeStacks({ StackName: stackName })
            .promise();
        stackResult.Stacks?.forEach((stack) => {
            stack.Outputs?.forEach((output) => {
                if (output.OutputKey) {
                    outputs[output.OutputKey] = output.OutputValue;
                }
            });
        });
    }
    else {
        const exportsResult = await cloudFormation.listExports().promise();
        exportsResult.Exports?.forEach((exp) => {
            if (exp.Name) {
                outputs[exp.Name] = exp.Value;
            }
        });
    }
    return Object.fromEntries(names.map((name) => {
        const value = outputs[name];
        if (!value) {
            throw new plugin_error_1.default(pluginName, `No ${stackName ? `${stackName} stack output` : 'CLoudFormation export'} found named: "${name}"`);
        }
        return [name, value];
    }));
};
