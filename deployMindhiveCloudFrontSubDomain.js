"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gulp_1 = require("gulp");
const gulp_cf_deploy_1 = __importDefault(require("gulp-cf-deploy"));
const path_1 = __importDefault(require("path"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const awsMasterCredentials_1 = require("./internal/awsMasterCredentials");
const requiredDomainSuffix = '.mindhive.cloud';
exports.default = ({ domainName, cloudFrontDomainName, stackName = `dns-${domainName.replaceAll('.', '-')}`, }) => {
    if (!domainName.endsWith(requiredDomainSuffix)) {
        throw new plugin_error_1.default('deployMindhiveCloudFrontSubDomain', `domainName must be in: ${requiredDomainSuffix}`);
    }
    return (0, gulp_1.src)(path_1.default.join(__dirname, 'cfn/mindhive-cloud-front-sub-domain.cfn.yaml')).pipe((0, gulp_cf_deploy_1.default)({ credentials: awsMasterCredentials_1.master, region: 'us-east-1' }, {
        ResourceTypes: [
            // Because the of the policy conditions
            'AWS::Route53::RecordSet',
        ],
        StackName: stackName,
    }, { domainName, cloudFrontDomainName }));
};
