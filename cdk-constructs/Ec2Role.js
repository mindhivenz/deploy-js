"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ec2Role = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const ssmAgent_1 = require("../internal/ssmAgent");
const ec2Principal = new aws_cdk_lib_1.aws_iam.ServicePrincipal('ec2.amazonaws.com');
class Ec2Role extends aws_cdk_lib_1.aws_iam.Role {
    constructor(scope, id, { managedPolicies = [], ...props }) {
        super(scope, id, {
            assumedBy: ec2Principal,
            managedPolicies: [...ssmAgent_1.ssmAgentManagedPolicies, ...managedPolicies],
            ...props,
        });
    }
}
exports.Ec2Role = Ec2Role;
