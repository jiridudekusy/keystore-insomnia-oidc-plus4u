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
const secureStoreLoc = path.join(homedir, ".insomnia-plugin-oidc-plus4u", "vault.data");
const secureStore = require("./lib/securestore");

let password;

async function testLogin(accessCode1, accessCode2) {
  if (accessCode1.length === 0 || accessCode2.length === 0) {
    throw `Access code cannot be empty. Ignore this error for "Prompt ad-hoc".`;
  }
  let credentials = {
    accessCode1,
    accessCode2,
    grant_type: "password"
  };
  let resp = await r2.post("https://oidc.plus4u.net/uu-oidcg01-main/0-0/grantToken", {json: credentials}).json;
  if (Object.keys(resp.uuAppErrorMap).length > 0) {
    return false;
  }
  return true;
}

async function readSecureStore() {
  if (!fs.existsSync(secureStoreLoc)) {
    console.log("Initializing secure store.");
    mkdirp(path.dirname(secureStoreLoc));
    let password2;
    do {
      password = await read({prompt: `Secure store password : `, silent: true});
      password2 = await read({prompt: `Retype Secure store password : `, silent: true});
    } while (password !== password2);
    await secureStore.write({}, password);
    return {};
  } else {
    password = await read({prompt: `Secure store password : `, silent: true});
    return await secureStore.read(password);
  }
}

async function addUser(options) {
  let secureStoreCnt = await readSecureStore();
  let ac1 = await read({prompt: `Access code 1 for ${options.user} : `, silent: true});
  let ac2 = await read({prompt: `Access code 2 for ${options.user} : `, silent: true});
  if (await testLogin(ac1, ac2)) {
    console.log("Login has been sucessful.");
    secureStoreCnt[options.user] = {ac1, ac2};
    secureStore.write(secureStoreCnt, password);
    console.log(`Access code 1 and Access code 2 for user ${options.user} has been sucessfully stored into secure store.`);
  } else {
    console.error("Cannot login to oidc.plus4u.net. Probabaly invalid combination of Access Code 1 and Access Code 2.");
  }
}

const parametersdefinitions = [
  {
    name: "user",
    alias: "u",
    type: String,
    typeLabel: "{user uid}",
    description: "UID of user(human or uuEE)."
  },
  {
    name: "command",
    defaultOption: true,
    type: String,
    description: "add | delete"
  },
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Displays this usage guide."
  }
];

// const usage = commandLineUsage(sections);
const options = commandLineArgs(parametersdefinitions);

const valid = options.help || (options.user && options.command);
if (!valid || options.help) {
  console.log("Invalid");
  process.exit();
}

if (options.command === "add") {
  addUser(options);
}