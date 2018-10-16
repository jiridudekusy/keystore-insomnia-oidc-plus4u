const path = require("path");
const fs = require("fs");
const {promisify} = require('util');
const mkdirp = promisify(require("mkdirp"));



const homedir = require('os').homedir();
const secureStoreLoc = path.join(homedir, ".oidc-plus4u-vault", "vault.data");
const mycrypto = require("./mycrypto");

function write(content, password) {
  mkdirp(path.dirname(secureStoreLoc));
  let encrypted = mycrypto.encrypt(JSON.stringify(content), password);
  fs.writeFileSync(secureStoreLoc, encrypted);
}

function read(password) {
  let encrypted = fs.readFileSync(secureStoreLoc);
  let decrypted = mycrypto.decrypt(encrypted.toString(),password);
  return JSON.parse(decrypted);
}

function exists() {
  return fs.existsSync(secureStoreLoc);
}

module.exports = { read, write, exists };