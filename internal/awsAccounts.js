"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessRoleSessionName = exports.accessTargetRoleArn = exports.accessTargetRoleName = exports.resolveAccount = exports.devsOwnAccountName = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const once_1 = __importDefault(require("lodash/once"));
const range_1 = __importDefault(require("lodash/range"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const devName_1 = __importDefault(require("../devName"));
const publicStageName_1 = __importDefault(require("../publicStageName"));
const awsMasterCredentials_1 = require("./awsMasterCredentials");
const pluginName = '@mindhivenz/deploy/awsAccounts';
const onlyValidAwsOrganizationsRegion = 'us-east-1';
const groupNameCombinations = (proj) => {
    const projParts = proj.split('-');
    return (0, range_1.default)(projParts.length, 0, -1).map((i) => projParts.slice(0, i).join('-'));
};
const devsOwnAccountName = (name) => (0, publicStageName_1.default)('dev', name);
exports.devsOwnAccountName = devsOwnAccountName;
const accountNameCombinations = ({ proj, stage, devName }) => {
    const stagePublic = (0, publicStageName_1.default)(stage, devName);
    const result = groupNameCombinations(proj).map((g) => `${g}-${stagePublic}`);
    if (stage === 'dev') {
        result.push((0, exports.devsOwnAccountName)(devName || (0, devName_1.default)()));
    }
    return result;
};
const listAccounts = (0, once_1.default)(async () => {
    const orgs = new aws_sdk_1.default.Organizations({
        apiVersion: '2016-11-28',
        credentials: awsMasterCredentials_1.master,
        region: onlyValidAwsOrganizationsRegion,
    });
    let nextToken;
    const allAccounts = [];
    do {
        const listResult = await orgs
            .listAccounts({
            NextToken: nextToken,
        })
            .promise();
        if (listResult?.Accounts) {
            allAccounts.push(...listResult.Accounts);
        }
        nextToken = listResult.NextToken;
    } while (nextToken);
    if (!allAccounts) {
        throw new Error('listAccounts unexpectedly did not return Accounts');
    }
    return allAccounts;
});
const resolveAccount = async (options) => {
    const accounts = await listAccounts();
    const namePrecedence = accountNameCombinations(options);
    const account = namePrecedence
        .map((name) => accounts.find((a) => a.Name === name))
        .find(Boolean);
    if (!account || !account.Id) {
        throw new plugin_error_1.default(pluginName, `Couldn't match linked account. Searched: ${JSON.stringify(namePrecedence)}. Check AWS Organizations.`);
    }
    return account;
};
exports.resolveAccount = resolveAccount;
exports.accessTargetRoleName = 'ops';
const accessTargetRoleArn = (accountId, roleName) => `arn:aws:iam::${accountId}:role/${roleName}`;
exports.accessTargetRoleArn = accessTargetRoleArn;
const accentuateAccountName = (name) => name.replace('production', 'PRODUCTION');
const accessRoleSessionName = ({ accountName, devName, roleName, }) => {
    const parts = [
        accentuateAccountName(accountName),
        devName || (0, devName_1.default)(),
    ];
    if (roleName) {
        parts.push(roleName);
    }
    return parts.join('-');
};
exports.accessRoleSessionName = accessRoleSessionName;
