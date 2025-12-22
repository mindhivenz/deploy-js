"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeRoleArn = exports.nodeRoleName = void 0;
const nodeRoleName = (customer) => `node@${customer}`;
exports.nodeRoleName = nodeRoleName;
const nodeRoleArn = (accountId, customer) => `arn:aws:iam::${accountId}:role/${(0, exports.nodeRoleName)(customer)}`;
exports.nodeRoleArn = nodeRoleArn;
