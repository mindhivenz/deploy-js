"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeRole = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const sharedNames_1 = require("../internal/sharedNames");
const ssmAgent_1 = require("../internal/ssmAgent");
const ssmPrincipal = new aws_cdk_lib_1.aws_iam.ServicePrincipal('ssm.amazonaws.com');
class NodeRole extends aws_cdk_lib_1.aws_iam.Role {
    constructor(scope, id, { customer, managedPolicies = [], ...props }) {
        super(scope, id, {
            assumedBy: ssmPrincipal,
            description: `Role for ${customer} SSM managed instances`,
            managedPolicies: [...ssmAgent_1.ssmAgentManagedPolicies, ...managedPolicies],
            roleName: (0, sharedNames_1.nodeRoleName)(customer),
            ...props,
        });
    }
}
exports.NodeRole = NodeRole;
