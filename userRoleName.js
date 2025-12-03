"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoleName = void 0;
const awsAccounts_1 = require("./internal/awsAccounts");
exports.userRoleName = process.env.MHD_ROLE_NAME ?? awsAccounts_1.accessTargetRoleName;
