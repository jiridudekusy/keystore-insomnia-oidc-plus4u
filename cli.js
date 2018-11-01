#!/usr/bin/env node
const r2 = require("r2");
const crypto = require("crypto");
const {promisify} = require('util');
const read = promisify(require("read"));
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");

const path = require("path");
const fs = require("fs");

const homedir = require('os').homedir();
const secureStore = require("./lib/securestore");

const DEFAULT_OIDC_SERVER = "https://oidc.plus4u.net/uu-oidcg01-main/0-0";

let password;

async function testLogin(accessCode1, accessCode2, oidcServer) {
  if (accessCode1.length === 0 || accessCode2.length === 0) {
    throw `Access code cannot be empty. Ignore this error for "Prompt ad-hoc".`;
  }
  let credentials = {
    accessCode1,
    accessCode2,
    grant_type: "password"
  };
  let tokenEndpointUrl = await getTokenEndpoint(oidcServer);
  let resp = await r2.post(tokenEndpointUrl, {json: credentials}).json;
  if (Object.keys(resp.uuAppErrorMap).length > 0) {
    return false;
  }
  return true;
}

async function getTokenEndpoint(oidcServer) {
  let oidcServerConfigUrl = (oidcServer || DEFAULT_OIDC_SERVER) + "/.well-known/openid-configuration";
  let oidcConfig = await r2.get(oidcServerConfigUrl).json;
  if (Object.keys(oidcConfig.uuAppErrorMap).length > 0) {
    throw `Cannot get configuration of OIDC server on ${oidcServer}. Probably invalid URL.`;
  }
  return oidcConfig.token_endpoint;
}

async function readSecureStore() {
  if (!secureStore.exists()) {
    console.log("Initializing secure store.");
    let password2;
    do {
      password = await read({prompt: `Secure store password : `, silent: true});
      password2 = await read({prompt: `Retype Secure store password : `, silent: true});
    } while (password !== password2);
    secureStore.write({}, password);
    return {};
  } else {
    password = await read({prompt: `Secure store password : `, silent: true});
    return secureStore.read(password);
  }
}

async function addUser(options) {
  let secureStoreCnt = await readSecureStore();
  let ac1 = await read({prompt: `Access code 1 for ${options.user} : `, silent: true});
  let ac2 = await read({prompt: `Access code 2 for ${options.user} : `, silent: true});
  let oidcServer = options.url;
  console.log("Trying to login using provided credentials...");
  if (await testLogin(ac1, ac2, oidcServer)) {
    console.log("Login has been successful.");
    secureStoreCnt[options.user] = {ac1, ac2, oidcServer};
    secureStore.write(secureStoreCnt, password);
    console.log(`Access code 1 and Access code 2 for user ${options.user} has been successfully stored into secure store.`);
  } else {
    console.error("Cannot login to oidc.plus4u.net. Probably invalid combination of Access Code 1 and Access Code 2.");
  }
}

async function deleteUser(options) {
  let secureStoreCnt = await readSecureStore();
  secureStoreCnt[options.user] = null;
  secureStore.write(secureStoreCnt, password);
}

const parametersdefinitions = [
  {
    name: "user",
    alias: "u",
    type: String,
    typeLabel: "{underline user uid}",
    description: "UID of user(human or uuEE) or alias such as 'you'."
  },  
  {
    name: "url",
    type: String,
    typeLabel: "{underline oidc url}",
    description: "URL to the OIDC server. If not set, defaults to " + DEFAULT_OIDC_SERVER + "."
  },
  {
    name: "command",
    defaultOption: true,
    type: String,
    description: "add (adds user credentials to the vault) | delete (removes user credentials from the vault)"
  },
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Displays this usage guide."
  }
];

const sections = [
  {
    header: "oidc-plus4u-vault",
    content: "Utility tool for maintaining AES-265 encrypted file with accessCodes to oidc.plus4u.net."
  },
  {
    header: "Synopsis",
    content: [
      "oidc-plus4u-vault {underline parameters} {underline command}",
      "oidc-plus4u-vault {bold --user} {underline user} [{bold --url} {underline oidc url}] add",
      "oidc-plus4u-vault {bold --user} {underline user} delete",
      "oidc-plus4u-vault {bold --help}"
    ]
  },
  {
    header: "Commands",
    content: [
      "{bold add} - adds user credentials to the vault",
      "{bold delete} - removes user credentials from the vault",
    ]
  },
  {
    header: "Parameters",
    optionList: parametersdefinitions.filter(p => p.name != "command")
  }
];

const usage = commandLineUsage(sections);
const options = commandLineArgs(parametersdefinitions);

const valid = options.help || (options.user && options.command && ["add","delete"].includes(options.command));
if (!valid || options.help) {
  console.log(usage);
  process.exit();
}

if (options.command === "add") {
  addUser(options);
}