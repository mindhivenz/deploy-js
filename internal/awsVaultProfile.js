"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.awsVaultProfile = void 0;
const awsAccounts_1 = require("./awsAccounts");
const mindhiveOpsAwsProfileName = `mindhive-ops`;
const awsVaultProfile = async ({ proj, stage, region, roleName, devName, }) => {
    const profileNameParts = stage === 'dev' ? [stage] : stage === 'production' ? [proj] : [proj, stage];
    if (roleName) {
        profileNameParts.push(roleName);
    }
    const profileName = profileNameParts.join('-');
    const header = `[profile ${profileName}]`;
    const account = await (0, awsAccounts_1.resolveAccount)({ proj, stage, devName });
    const iniProfile = [
        header,
        `source_profile = ${mindhiveOpsAwsProfileName}`,
        `role_arn = ${(0, awsAccounts_1.accessTargetRoleArn)(account.Id, roleName)}`,
        `role_session_name = ${(0, awsAccounts_1.accessRoleSessionName)({
            accountName: account.Name,
            devName,
            roleName,
        })}`,
    ];
    if (region) {
        iniProfile.push(`region = ${region}`);
    }
    return {
        profileName,
        header,
        iniProfile: iniProfile.join('\n'),
    };
};
exports.awsVaultProfile = awsVaultProfile;
