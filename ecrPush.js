"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fancy_log_1 = __importDefault(require("fancy-log"));
const awsCredentialsEnv_1 = __importDefault(require("./awsCredentialsEnv"));
const colors_1 = require("./colors");
const ecrImageRepo_1 = __importDefault(require("./ecrImageRepo"));
const execFile_1 = __importDefault(require("./execFile"));
const gitBranch_1 = __importDefault(require("./gitBranch"));
const gitHash_1 = __importDefault(require("./gitHash"));
const setEcrCredentialHelper_1 = __importDefault(require("./setEcrCredentialHelper"));
exports.default = async ({ localImageTag, repoName, remoteImageTag = '', tagWithGitHash = false, gitRepoPath, pushLatest = true, dryRun = false, ...repoHostOptions }) => {
    if (dryRun) {
        (0, fancy_log_1.default)("Running in dry run mode");
    }
    const repo = await (0, ecrImageRepo_1.default)({ name: repoName, ...repoHostOptions });
    if (!process.env.CI) {
        await (0, setEcrCredentialHelper_1.default)(repoHostOptions);
    }
    const tags = [];
    const awsEnv = await (0, awsCredentialsEnv_1.default)(repoHostOptions);
    if (remoteImageTag) {
        tags.push(remoteImageTag);
    }
    const branch = await (0, gitBranch_1.default)(gitRepoPath, { gitUpToDate: true });
    if (pushLatest && ['master', 'main', 'production'].includes(branch)) {
        tags.push("latest");
    }
    else {
        tags.push(`ci-${branch.replace(/[^a-zA-Z0-9-_.]/g, '_').substring(0, 125)}`);
    }
    if (tagWithGitHash) {
        const hashTag = await (0, gitHash_1.default)(gitRepoPath, { gitUpToDate: true });
        const { exitCode } = await (0, execFile_1.default)('docker', ['manifest', 'inspect', `${repo}:${hashTag}`], {
            env: {
                ...process.env,
                ...awsEnv,
            },
            okExitCodes: [0, 1],
        });
        if (exitCode === 0) {
            (0, fancy_log_1.default)(`There is already an image with git hashtag: ${(0, colors_1.highlight)(`${repo}:${hashTag}`)}`);
        }
        // Put hashTag first to ensure if latest is added, then the git hash is already there
        tags.splice(0, 0, hashTag);
    }
    for (const tag of tags) {
        await (0, execFile_1.default)('docker', ['tag', localImageTag, `${repo}:${tag}`]);
        if (dryRun) {
            (0, fancy_log_1.default)(`Run in dry run mode, would have pushed: ${repo}:${tag}`);
        }
        else {
            await (0, execFile_1.default)('docker', ['push', `${repo}:${tag}`], {
                env: {
                    ...process.env,
                    ...awsEnv,
                },
                pipeOutput: true,
            });
        }
    }
    const conciseRemotes = tags
        .map((tag, i) => (0, colors_1.highlight)(i === 0 ? `${repo}:${tag}` : `:${tag}`))
        .join(', ');
    (0, fancy_log_1.default)(`Pushed ${(0, colors_1.highlight)(localImageTag)} -> ${conciseRemotes}`);
};
