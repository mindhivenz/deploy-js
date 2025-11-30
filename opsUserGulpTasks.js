"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fancy_log_1 = __importDefault(require("fancy-log"));
const gulp_1 = require("gulp");
const devName_1 = __importDefault(require("./devName"));
const addAwsVaultProfile_1 = __importDefault(require("./internal/addAwsVaultProfile"));
const colors_1 = require("./colors");
const userRoleName_1 = require("./userRoleName");
const openAwsConsoleTask_1 = __importDefault(require("./internal/openAwsConsoleTask"));
const openManagedInstanceShellTask_1 = require("./internal/openManagedInstanceShellTask");
const args_1 = require("./internal/args");
exports.default = ({ proj, stages, region }) => {
    (0, gulp_1.task)('who-am-i', async () => {
        (0, fancy_log_1.default)(`You are devName: ${(0, colors_1.toCopy)((0, devName_1.default)())}`);
    });
    stages.forEach((stage) => {
        (0, gulp_1.task)(`open:aws:${stage}`, (0, openAwsConsoleTask_1.default)({ proj, stage, region }));
        (0, gulp_1.task)(`add:aws-vault:${stage}`, async () => {
            const args = (0, args_1.parseArgs)(args_1.globalArgs.option('profile-name', {
                type: 'string',
            }));
            (0, addAwsVaultProfile_1.default)({
                proj,
                stage,
                region,
                roleName: userRoleName_1.userRoleName,
                profileName: args.profileName,
            });
        });
        (0, gulp_1.task)(`open:shell:${stage}`, (0, openManagedInstanceShellTask_1.openManagedInstanceShellTask)({ proj, stage, region }));
        if (stage === 'production') {
            (0, gulp_1.task)(`open:aws`, (0, openAwsConsoleTask_1.default)({ proj, stage, region }));
            (0, gulp_1.task)(`open:shell`, (0, openManagedInstanceShellTask_1.openManagedInstanceShellTask)({ proj, stage, region }));
        }
    });
    if (!stages.includes('dev')) {
        const stage = 'dev';
        (0, gulp_1.task)(`open:aws:${stage}`, (0, openAwsConsoleTask_1.default)({ proj, stage, region }));
        (0, gulp_1.task)(`add:aws-vault:${stage}`, async () => {
            const args = (0, args_1.parseArgs)(args_1.globalArgs.option('profile-name', {
                type: 'string',
            }));
            (0, addAwsVaultProfile_1.default)({
                proj,
                stage,
                region,
                roleName: userRoleName_1.userRoleName,
                profileName: args.profileName,
            });
        });
    }
};
