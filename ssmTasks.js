"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ansi_colors_1 = require("ansi-colors");
const aws_sdk_1 = require("aws-sdk");
const date_fns_1 = require("date-fns");
const fancy_log_1 = __importDefault(require("fancy-log"));
const gulp_1 = require("gulp");
const awsServiceOptions_1 = __importDefault(require("./awsServiceOptions"));
const eyamlEncode_1 = __importDefault(require("./eyamlEncode"));
const colors_1 = require("./colors");
const nodeRoleNames_1 = require("./nodeRoleNames");
exports.default = ({ proj, region, customers }) => {
    const stage = 'production'; // REVISIT: will we activate nodes in non-production stages?
    customers.forEach((customer) => {
        const taskName = `generate:ssm-activation:${customer}`;
        (0, gulp_1.task)(taskName, async () => {
            const ssm = new aws_sdk_1.SSM((0, awsServiceOptions_1.default)({ proj, stage, region }));
            const expiryDate = (0, date_fns_1.addDays)(new Date(), 7);
            const activationResult = await ssm
                .createActivation({
                ExpirationDate: expiryDate,
                IamRole: (0, nodeRoleNames_1.nodeRoleName)(customer),
                RegistrationLimit: 10,
            })
                .promise();
            const code = activationResult.ActivationCode;
            const encodedCode = await (0, eyamlEncode_1.default)(code, { proj, region });
            (0, fancy_log_1.default)([
                `Add the following to ${(0, colors_1.highlight)(`${proj}-control`)} data for ${(0, colors_1.highlight)(customer)}:`,
                (0, ansi_colors_1.green)(`# This activation is valid until ${expiryDate.toUTCString()}, regenerate with:`),
                (0, ansi_colors_1.green)(`# mhd ${taskName}`),
                `${(0, ansi_colors_1.yellow)('hybrid_ssm_agent::activation')}:`,
                `  ${(0, ansi_colors_1.yellow)('id')}: ${activationResult.ActivationId}`,
                `  ${(0, ansi_colors_1.yellow)('code')}: ${encodedCode}`,
                `${(0, ansi_colors_1.yellow)('hybrid_ssm_agent::region')}: ${region}`,
            ].join('\n'));
        });
    });
};
