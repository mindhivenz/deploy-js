"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findControlSecrets = exports.describeFilters = exports.controlSecrets = exports.controlRepoDir = exports.scopeName = exports.FILTER_NAMES = void 0;
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const sortBy_1 = __importDefault(require("lodash/sortBy"));
const uniq_1 = __importDefault(require("lodash/uniq"));
const path_1 = __importDefault(require("path"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const execFile_1 = __importDefault(require("./execFile"));
const eyamlDecode_1 = require("./eyamlDecode");
const pluginName = '@mindhivenz/deploy/controlSecrets';
exports.FILTER_NAMES = [
    'customer',
    'site',
    'host',
    'key',
    'file',
];
const scopeName = ({ customer, site, host }) => [customer, site, host].filter(Boolean).join('/') || 'common';
exports.scopeName = scopeName;
// Control repos are the project repo with a -control suffix, as mhd resolves them
const controlRepoDir = async (cwd = process.cwd()) => {
    const { stdOut } = await (0, execFile_1.default)('git', ['rev-parse', '--show-toplevel'], {
        cwd,
        captureOutput: true,
    });
    const repoDir = stdOut.trim();
    return repoDir.endsWith('-control') ? repoDir : `${repoDir}-control`;
};
exports.controlRepoDir = controlRepoDir;
const yamlFiles = (dir) => (0, sortBy_1.default)(fs_1.default.readdirSync(dir, { withFileTypes: true }), 'name').flatMap((entry) => {
    const full = path_1.default.join(dir, entry.name);
    if (entry.isDirectory()) {
        return yamlFiles(full);
    }
    return entry.name.endsWith('.yaml') ? [full] : [];
});
// Hiera hierarchy: common.yaml, <customer>/(common|<site>).yaml, <customer>/<site>/<host>.yaml
const scopeOf = (relFile) => {
    const segments = relFile.split(path_1.default.sep);
    const name = path_1.default.basename(segments[segments.length - 1], '.yaml');
    if (segments.length === 1) {
        return { customer: '', site: '', host: '' };
    }
    if (segments.length === 2) {
        return {
            customer: segments[0],
            site: name === 'common' ? '' : name,
            host: '',
        };
    }
    return { customer: segments[0], site: segments[1], host: name };
};
const encryptedIn = (node, keyPath = []) => {
    if (typeof node === 'string') {
        return eyamlDecode_1.ENC_PATTERN.test(node.trim())
            ? [{ key: keyPath.join('.'), cipher: node.trim() }]
            : [];
    }
    if (Array.isArray(node)) {
        return node.flatMap((item, i) => encryptedIn(item, [...keyPath, `${i}`]));
    }
    if (node && typeof node === 'object') {
        return Object.entries(node).flatMap(([key, value]) => encryptedIn(value, [...keyPath, key]));
    }
    return [];
};
const controlSecrets = async (controlDir) => {
    const dataDir = path_1.default.join(controlDir || (await (0, exports.controlRepoDir)()), 'data');
    if (!fs_1.default.existsSync(dataDir)) {
        throw new plugin_error_1.default(pluginName, `Hiera data not found at ${dataDir}, is the control repo cloned alongside this project?`);
    }
    return yamlFiles(dataDir).flatMap((file) => {
        const relFile = path_1.default.relative(dataDir, file);
        const scope = scopeOf(relFile);
        return encryptedIn(js_yaml_1.default.load(fs_1.default.readFileSync(file, 'utf8'))).map((secret) => ({
            ...secret,
            ...scope,
            file: path_1.default.join('data', relFile),
        }));
    });
};
exports.controlSecrets = controlSecrets;
const contains = (value, filter) => !filter || value.toLowerCase().includes(filter.toLowerCase());
const describeFilters = (filters) => {
    const applied = exports.FILTER_NAMES.filter((name) => filters[name]).map((name) => `--${name}=${filters[name]}`);
    return applied.length ? applied.join(' ') : 'no filters';
};
exports.describeFilters = describeFilters;
// Every filter is a case insensitive substring match, so partial names work
const findControlSecrets = async (filters, controlDir) => {
    const available = await (0, exports.controlSecrets)(controlDir);
    const matched = available.filter((secret) => contains(secret.customer, filters.customer) &&
        contains(secret.site, filters.site) &&
        contains(secret.host, filters.host) &&
        contains(secret.key, filters.key) &&
        contains(secret.file, filters.file));
    if (!matched.length) {
        const customers = (0, uniq_1.default)(available.map(({ customer }) => customer || 'common'));
        const sites = (0, uniq_1.default)(available
            .filter(({ customer }) => contains(customer, filters.customer))
            .map(({ site }) => site)
            .filter(Boolean));
        throw new plugin_error_1.default(pluginName, `No encrypted secrets match ${(0, exports.describeFilters)(filters)}\n` +
            `Customers: ${(0, sortBy_1.default)(customers).join(', ')}\n` +
            `Sites: ${(0, sortBy_1.default)(sites).join(', ') || '<none>'}`);
    }
    return (0, sortBy_1.default)(matched, ['customer', 'site', 'host', 'key']);
};
exports.findControlSecrets = findControlSecrets;
