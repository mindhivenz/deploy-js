"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projCredentialsFactory = exports.ProjCredentials = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fancy_log_1 = __importDefault(require("fancy-log"));
const memoize_1 = __importDefault(require("lodash/memoize"));
const colors_1 = require("../colors");
const userRoleName_1 = require("../userRoleName");
const awsAccounts_1 = require("./awsAccounts");
require("./awsConfig");
const awsMasterCredentials_1 = require("./awsMasterCredentials");
const awsSession_1 = require("./awsSession");
class ProjCredentials extends aws_sdk_1.default.ChainableTemporaryCredentials {
    constructor(projOptions) {
        super({
            masterCredentials: awsMasterCredentials_1.master,
            stsConfig: { stsRegionalEndpoints: 'regional' },
        });
        this.projOptions = projOptions;
    }
    refresh(callback) {
        this._resolveRoleArn().then(() => {
            super.refresh(callback);
        }, (err) => {
            callback?.(err);
        });
    }
    async _resolveRoleArn() {
        const params = this.service.config.params;
        if (params.RoleArn) {
            return;
        }
        const account = await (0, awsAccounts_1.resolveAccount)(this.projOptions);
        params.RoleArn = (0, awsAccounts_1.accessTargetRoleArn)(account.Id, userRoleName_1.userRoleName);
        params.RoleSessionName = (0, awsAccounts_1.accessRoleSessionName)({
            accountName: account.Name,
        });
        if (this.projOptions.fullDurationSession) {
            const chainedRoles = await (0, awsMasterCredentials_1.masterIsRole)();
            if (chainedRoles) {
                (0, fancy_log_1.default)(`${(0, colors_1.highlight)("Can't use full duration session")} as your master credentials are a role/session. AWS limits chained roles to 1 hour sessions, using that instead.`);
                if ('AWS_VAULT' in process.env) {
                    (0, fancy_log_1.default)(`Use: ${(0, colors_1.commandLine)('aws-vault exec --no-session ...')}`);
                }
                params.DurationSeconds = awsSession_1.MAX_CHAINED_ROLE_SESSION_SECONDS;
            }
            else {
                params.DurationSeconds = awsSession_1.MAX_SESSION_SECONDS;
            }
        }
    }
}
exports.ProjCredentials = ProjCredentials;
const credentialsFactory = (options) => process.env.CI
    ? new aws_sdk_1.default.EnvironmentCredentials('AWS')
    : process.env.EC2_PROJ_CREDENTIALS
        ? new aws_sdk_1.default.EC2MetadataCredentials()
        : process.env.SSM_PROJ_CREDENTIALS
            ? new aws_sdk_1.default.SharedIniFileCredentials()
            : new ProjCredentials(options);
exports.projCredentialsFactory = (0, memoize_1.default)(credentialsFactory, ({ fullDurationSession = false, proj, stage }) => `${proj}/${stage}/${fullDurationSession}`);
