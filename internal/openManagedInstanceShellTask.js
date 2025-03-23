"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openManagedInstanceShellTask = void 0;
const aws_sdk_1 = require("aws-sdk");
const sortBy_1 = __importDefault(require("lodash/sortBy"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const prompts_1 = require("prompts");
const awsServiceOptions_1 = __importDefault(require("../awsServiceOptions"));
const ssmInteractiveCommand_1 = require("./ssmInteractiveCommand");
const openManagedInstanceShellTask = (opts) => async () => {
    const serviceOpts = (0, awsServiceOptions_1.default)(opts);
    const ssm = new aws_sdk_1.SSM(serviceOpts);
    const instances = [];
    let token;
    do {
        const instanceResult = await ssm
            .describeInstanceInformation({
            NextToken: token,
            MaxResults: 50,
        })
            .promise();
        if (instanceResult.InstanceInformationList) {
            instances.push(...instanceResult.InstanceInformationList);
        }
        token = instanceResult.NextToken;
    } while (token);
    if (instances.length === 0) {
        throw new plugin_error_1.default('open:shell', 'No instances found');
    }
    const choices = instances.map((inst) => ({
        title: (inst.ComputerName || inst.InstanceId) +
            (inst.PingStatus === 'Online' ? '' : ` (${inst.PingStatus})`),
        value: inst.InstanceId,
    }));
    const answers = await (0, prompts_1.prompt)({
        type: 'autocomplete',
        name: 'instanceId',
        message: 'Host',
        choices: (0, sortBy_1.default)(choices, 'title'),
    });
    if (!answers.instanceId) {
        return;
    }
    await (0, ssmInteractiveCommand_1.ssmInteractiveCommand)(opts, answers.instanceId, 'sudo -i -u root');
};
exports.openManagedInstanceShellTask = openManagedInstanceShellTask;
