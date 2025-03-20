"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yarnVersionBumpArgs = void 0;
const args_1 = require("./args");
const group = 'Version bump';
const yarnVersionBumpArgs = () => {
    const argv = (0, args_1.parseArgs)(args_1.globalArgs
        .option('patch', {
        boolean: true,
        group,
    })
        .option('minor', {
        boolean: true,
        group,
    })
        .option('major', {
        boolean: true,
        group,
    })
        .option('same', {
        boolean: true,
        group,
    }), { complete: false });
    const versionBumpOptions = ['same', 'major', 'minor', 'patch'];
    const versionBump = versionBumpOptions.find((v) => argv[v] === true) ?? 'same';
    if (versionBump === 'same') {
        return [];
    }
    return [`--${versionBump}`];
};
exports.yarnVersionBumpArgs = yarnVersionBumpArgs;
