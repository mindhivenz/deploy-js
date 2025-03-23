"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_cdk_lib_1 = require("aws-cdk-lib");
const datadog_1 = require("../internal/datadog");
exports.default = () => aws_cdk_lib_1.Fn.importValue(datadog_1.forwarderArnExportName);
