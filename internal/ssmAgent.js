"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssmAgentManagedPolicies = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
exports.ssmAgentManagedPolicies = [
    aws_cdk_lib_1.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    aws_cdk_lib_1.aws_iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy'),
];
