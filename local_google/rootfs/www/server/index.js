"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileAsJson = void 0;
global.WebSocket = require('ws');
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
dotenv_1.default.config();
const readFileAsJson = (filePath) => {
    console.info('Reading File:', filePath);
    const rawdata = fs.readFileSync(filePath);
    return JSON.parse(rawdata.toString());
};
exports.readFileAsJson = readFileAsJson;
const options = fs.existsSync('/data/options.json')
    ? (0, exports.readFileAsJson)('/data/options.json')
    : JSON.parse(((_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.options) || '{}');
console.debug('App options', options);
const port = process.env.SERVER_PORT || 4001;
Object.keys(process.env).forEach((x) => {
    console.log(`process.env.${x} = ${process.env[x]}`);
});
const app = (0, express_1.default)();
app.use('/', express_1.default.static('public'));
app.get('/api', (req, res) => {
    res.send({
        name: 'hello',
    });
});
app.get('/config.js', (req, res) => {
    const clientConfig = `
window.config = {
  API: ${port},
  SOCKET: 123
};
  `;
    res.set('Content-Type', 'application/javascript');
    res.send(clientConfig);
});
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
const handle = (signal) => {
    console.log(`*^!@4=> Received event: ${signal}`);
};
process.on('SIGHUP', handle);
