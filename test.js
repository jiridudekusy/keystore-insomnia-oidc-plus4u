const r2 = require("r2");
const crypto = require("crypto");
const {promisify} = require('util');
const read = promisify(require("read"));
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const mkdirp = promisify(require("mkdirp"));
const path = require("path");
const fs = require("fs");

const homedir = require('os').homedir();
const algorithm = "aes-256-ctr";
const secureStoreLoc = path.join(homedir, ".insomnia-plugin-oidc-plus4u", "vault.data");

let password = "a";

let content = {};

var cipher = crypto.createCipher(algorithm, password);
var encrypted = cipher.update(JSON.stringify(content), "utf8");
encrypted = Buffer.concat([encrypted, cipher.final()]);
fs.writeFileSync("/tmp/test.crypt", encrypted);

let encrypted2 = fs.readFileSync("/tmp/test.crypt");

var decipher = crypto.createDecipher(algorithm, password);
var decrypted = decipher.update(encrypted2, "hex", "utf8");
decrypted += decipher.final("utf8");
let res = JSON.parse(decrypted);

console.log(JSON.stringify(res));