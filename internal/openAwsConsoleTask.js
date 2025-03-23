"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const open_1 = __importDefault(require("open"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const querystring_1 = __importDefault(require("querystring"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fancy_log_1 = __importDefault(require("fancy-log"));
const url_1 = require("url");
const colors_1 = require("../colors");
const args_1 = require("./args");
const awsProjCredentials_1 = require("./awsProjCredentials");
const awsSession_1 = require("./awsSession");
exports.default = ({ proj, stage, region, urlParts = {} }) => async () => {
    const { open: wantOpen, verbose, safari, } = (0, args_1.parseArgs)(args_1.globalArgs
        .option('open', {
        type: 'boolean',
        default: true,
    })
        .option('safari', {
        type: 'boolean',
    }));
    const credentials = (0, awsProjCredentials_1.projCredentialsFactory)({
        fullDurationSession: true,
        proj,
        stage,
    });
    await credentials.getPromise();
    const tempCredentials = {
        sessionId: credentials.accessKeyId,
        sessionKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
    };
    const federationResponse = await (0, node_fetch_1.default)(`https://signin.aws.amazon.com/federation?${querystring_1.default.stringify({
        Action: 'getSigninToken',
        Session: JSON.stringify(tempCredentials),
    })}`);
    if (!federationResponse.ok) {
        throw new plugin_error_1.default('openAwsConsoleTask', `Failed getting signin token: ${federationResponse.statusText}`);
    }
    const federationResult = (await federationResponse.json());
    const destinationUrl = new url_1.URL(`https://${region}.console.aws.amazon.com/console/home?region=${region}#`);
    Object.assign(destinationUrl, urlParts);
    const target = `https://signin.aws.amazon.com/federation?${querystring_1.default.stringify({
        Action: 'login',
        Destination: destinationUrl.href,
        Issuer: '',
        SessionDuration: awsSession_1.MAX_SESSION_SECONDS,
        SigninToken: federationResult.SigninToken,
    })}`;
    if (!wantOpen || verbose) {
        (0, fancy_log_1.default)(`Sign in: ${(0, colors_1.url)(target)}`);
    }
    if (wantOpen) {
        await (0, open_1.default)(target, {
            app: safari ? { name: 'safari' } : undefined,
        });
    }
};
