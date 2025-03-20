"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatadogServerlessMacro = void 0;
/* tslint:disable no-unused-expression */
const aws_cdk_lib_1 = require("aws-cdk-lib");
const constructs_1 = require("constructs");
const importDatadogForwarderArn_1 = __importDefault(require("./importDatadogForwarderArn"));
class DatadogServerlessMacro extends constructs_1.Construct {
    constructor(scope, id, props = {}) {
        super(scope, id);
        const stack = aws_cdk_lib_1.Stack.of(this);
        new aws_cdk_lib_1.CfnMapping(stack, 'Datadog', {
            mapping: {
                Parameters: {
                    nodeLayerVersion: '51',
                    pythonLayerVersion: '32',
                    stackName: stack.stackName,
                    service: stack.stackName,
                    logLevel: 'INFO',
                    ...props,
                },
            },
        });
        stack.addTransform('DatadogServerless');
    }
    monitorFunction(func) {
        new aws_cdk_lib_1.aws_logs.CfnSubscriptionFilter(this, `${func.node.id}-DatadogSubscription`, {
            filterPattern: '',
            logGroupName: func.logGroup.logGroupName,
            destinationArn: (0, importDatadogForwarderArn_1.default)(),
        });
    }
}
exports.DatadogServerlessMacro = DatadogServerlessMacro;
