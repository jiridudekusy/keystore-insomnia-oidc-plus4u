const path = require("path");
const fs = require("fs");
const {promisify} = require('util');
const mkdirp = promisify(require("mkdirp"));

const homedir = require('os').homedir();
const defaultSecureStoreLoc = path.join(homedir, ".oidc-plus4u-vault", "vault.data");
const mycrypto = require("./mycrypto");

function write(content, password, file = defaultSecureStoreLoc) {
  mkdirp(path.dirname(file));
  let encrypted = mycrypto.encrypt(JSON.stringify(content), password);
  fs.writeFileSync(file, encrypted);
}

function read(password, file = defaultSecureStoreLoc) {
  let encrypted = fs.readFileSync(file);
  return readFromBytes(password, encrypted);
}

function readFromBytes(password, bytes) {
  let decrypted = mycrypto.decrypt(bytes.toString(), password);
  return JSON.parse(decrypted);
}

function exists(file = defaultSecureStoreLoc) {
  return fs.existsSync(file);
}

module.exports = { read, readFromBytes, write, exists };
