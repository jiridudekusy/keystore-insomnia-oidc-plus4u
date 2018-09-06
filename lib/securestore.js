const path = require("path");
const fs = require("fs");

const homedir = require('os').homedir();
const secureStoreLoc = path.join(homedir, ".insomnia-plugin-oidc-plus4u", "vault.data");
const mycrypto = require("./mycrypto");

async function write(content, password) {
  let encrypted = mycrypto.encrypt(JSON.stringify(content), password);
  fs.writeFileSync(secureStoreLoc, encrypted);
}

async function read(password) {
  let encrypted = fs.readFileSync(secureStoreLoc);
  let decrypted = mycrypto.decrypt(encrypted.toString(),password);
  return JSON.parse(decrypted);
}

module.exports = { read, write };