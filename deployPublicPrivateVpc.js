"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = require("gulp");
const gulp_cf_deploy_1 = __importDefault(require("gulp-cf-deploy"));
const gulp_json_editor_1 = __importDefault(require("gulp-json-editor"));
const gulp_rename_1 = __importDefault(require("gulp-rename"));
const path_1 = __importDefault(require("path"));
const awsServiceOptions_1 = __importDefault(require("./awsServiceOptions"));
const cidr16HashedPrefix_1 = __importDefault(require("./cidr16HashedPrefix"));
/* The following is required in the role launching this (like serverless iamRoleStatements)

    - Effect: Allow
      Action:
        - ec2:CreateNetworkInterface
        - ec2:DescribeNetworkInterfaces
        - ec2:DetachNetworkInterface
        - ec2:DeleteNetworkInterface
      Resource: "*"
 */
const numberedKeysToArray = (obj, keyPrefix) => {
    const result = [];
    let i = 1;
    while (`${keyPrefix}${i}` in obj) {
        result.push(obj[`${keyPrefix}${i}`]);
        i += 1;
    }
    return result;
};
exports.default = ({ proj, stage, region, azCount = stage === 'dev' ? 1 : 2, ipPrefix = (0, cidr16HashedPrefix_1.default)(proj), }) => (0, gulp_1.src)(path_1.default.join(__dirname, `cfn/vpc-${azCount}.cfn.yaml`))
    .pipe((0, gulp_cf_deploy_1.default)((0, awsServiceOptions_1.default)({ proj, stage, region }), `${proj}-vpc`, {
    ipPrefix,
}))
    .pipe((0, gulp_json_editor_1.default)((awsVpcFlat) => ({
    ipAddresses: numberedKeysToArray(awsVpcFlat, 'ipAddressLambda'),
    securityGroupId: awsVpcFlat.securityGroupIdLambda,
    vpcSubnetIds: numberedKeysToArray(awsVpcFlat, 'vpcSubnetIdLambda'),
})))
    .pipe((0, gulp_rename_1.default)('aws-vpc.json'));
