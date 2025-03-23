"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = require("aws-sdk");
const fancy_log_1 = __importDefault(require("fancy-log"));
const fs_1 = require("fs");
const memoize_1 = __importDefault(require("lodash/memoize"));
const p_limit_1 = __importDefault(require("p-limit"));
const path_1 = __importDefault(require("path"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const stream_1 = __importDefault(require("stream"));
const util_1 = require("util");
const colors_1 = require("./colors");
const args_1 = require("./internal/args");
const streamFinished = (0, util_1.promisify)(stream_1.default.finished);
const ensureTrailingSlash = (dirPath) => {
    if (dirPath.endsWith('/')) {
        return dirPath;
    }
    return `${dirPath}/`;
};
const stripTrailingSlash = (dirPath) => {
    if (dirPath.endsWith('/')) {
        return dirPath.substr(0, dirPath.length - 1);
    }
    return dirPath;
};
exports.default = ({ serviceOpts, bucket, useAccelerateEndpoint = true, }) => {
    const s3 = new aws_sdk_1.S3({
        ...serviceOpts,
        useAccelerateEndpoint,
    });
    const headLimit = (0, p_limit_1.default)(16);
    const getLimit = (0, p_limit_1.default)(8);
    const sync = {
        file: (0, memoize_1.default)(async ({ s3Path, cachePath }) => {
            const { verbose } = (0, args_1.parseArgs)(args_1.globalArgs);
            let stat;
            try {
                stat = await fs_1.promises.stat(cachePath);
            }
            catch (e) {
                if (e.code !== 'ENOENT') {
                    throw e;
                }
                await fs_1.promises.mkdir(path_1.default.dirname(cachePath), { recursive: true });
                stat = null;
            }
            const s3Params = {
                Bucket: bucket,
                Key: s3Path,
            };
            let head;
            try {
                head = await headLimit(() => s3.headObject(s3Params).promise());
            }
            catch (e) {
                if (e.code === 'NotFound') {
                    throw new plugin_error_1.default('@mindhive/deploy/syncS3', `S3 object not found in bucket: ${bucket}, path: ${s3Path}`);
                }
                throw e;
            }
            const updateReason = !stat
                ? "The local file doesn't exist"
                : head.LastModified > stat.mtime
                    ? 'The remote file is newer'
                    : head.ContentLength !== stat.size
                        ? 'The remote file is a different size'
                        : null;
            if (updateReason) {
                const sizeMiB = Math.round(head.ContentLength / 2 ** 20);
                (0, fancy_log_1.default)(`Downloading ${(0, colors_1.highlight)(cachePath)} of ${sizeMiB}MiB because: ${updateReason}`);
                await getLimit(() => streamFinished(s3
                    .getObject(s3Params)
                    .createReadStream()
                    .pipe((0, fs_1.createWriteStream)(cachePath))));
            }
            else {
                if (verbose) {
                    (0, fancy_log_1.default)(`Skipping ${(0, colors_1.highlight)(cachePath)} as up to date`);
                }
            }
        }, ({ cachePath }) => cachePath),
        dir: async ({ s3Path, cachePath, purgeLocal }) => {
            const s3Dir = ensureTrailingSlash(s3Path);
            const cacheDir = ensureTrailingSlash(cachePath);
            const contents = [];
            let token;
            do {
                try {
                    const listResult = await s3
                        .listObjectsV2({
                        Bucket: bucket,
                        Prefix: s3Dir,
                        ContinuationToken: token,
                    })
                        .promise();
                    if (listResult.Contents) {
                        contents.push(...listResult.Contents);
                    }
                    token = listResult.NextContinuationToken;
                }
                catch (e) {
                    if (e.code === 'NotFound') {
                        throw new plugin_error_1.default('@mindhive/deploy/syncS3', `No S3 objects not found under bucket: ${bucket}, prefix: ${s3Dir}`);
                    }
                    throw e;
                }
            } while (token);
            if (!contents.length) {
                (0, fancy_log_1.default)(`Remote ${(0, colors_1.url)(`s3://${bucket}/${s3Dir}`)} is empty`);
                return;
            }
            const suffixes = contents.flatMap(({ Key }) => {
                if (!Key) {
                    return [];
                }
                const suffix = Key.substring(s3Dir.length);
                if (!suffix) {
                    return [];
                }
                return [suffix];
            });
            if (purgeLocal) {
                try {
                    const localEntries = await fs_1.promises.readdir(stripTrailingSlash(cacheDir), {
                        withFileTypes: true,
                    });
                    await Promise.all(localEntries.map(async (entry) => {
                        if (!suffixes.some((suffix) => suffix === entry.name ||
                            suffix.startsWith(`${entry.name}/`))) {
                            const localPath = path_1.default.join(cacheDir, entry.name);
                            (0, fancy_log_1.default)(`Removing ${(0, colors_1.highlight)(localPath)} as no longer on server`);
                            if (entry.isDirectory()) {
                                await fs_1.promises.rmdir(localPath, {
                                    recursive: true,
                                });
                            }
                            else {
                                await fs_1.promises.unlink(localPath);
                            }
                        }
                    }));
                }
                catch (e) {
                    if (e.code !== 'ENOENT') {
                        throw e;
                    }
                }
            }
            await Promise.all(suffixes.map(async (suffix) => {
                await sync.file({
                    s3Path: s3Dir + suffix,
                    cachePath: path_1.default.join(cacheDir, suffix),
                });
            }));
        },
    };
    return sync;
};
