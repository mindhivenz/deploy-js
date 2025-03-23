"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const https_1 = __importDefault(require("https"));
const agent = new https_1.default.Agent({
    keepAlive: true,
});
const nearestRegion = process.env.NEAREST_REGION;
aws_sdk_1.default.config.update({
    httpOptions: {
        // See https://github.com/aws/aws-sdk-js/issues/2571
        agent,
    },
    ...(nearestRegion && {
        stsRegionalEndpoints: 'regional',
        sts: { region: nearestRegion },
    }),
});
