const TaskUtils = require("../misc/task-utils");
const SecureStoreCliCommon = require("../secure-store-cli-common");
const {promisify} = require('util');
const read = promisify(require("read"));
const r2 = require("r2");

const DEFAULT_OIDC_SERVER = "https://oidc.plus4u.net/uu-oidcg01-main/0-0";

const optionsDefinitions = [
  {
    name: "user",
    type: String,
    defaultOption: true,
    typeLabel: "{underline user uid}",
    description: "Default option. UID of user(human or uuEE) or alias such as 'you'."
  },
  {
    name: "url",
    type: String,
    typeLabel: "{underline oidc url}",
    description: "URL to the OIDC server. If not set, defaults to " + DEFAULT_OIDC_SERVER + "."
  },
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Displays this usage guide."
  }
];

const help = [
  {
    header: "add command",
    content: "Stores user credentials to the vault."
  },
  {
    header: 'Synopsis',
    content: [
      '$ oidc-plus4u-vault add {underline user uid}',
      '$ oidc-plus4u-vault add [{bold --url} {underline oidc url}] {underline user uid}'
    ]
  },
  {
    header: 'Options',
    optionList: optionsDefinitions
  }
];

class AddTask {

  constructor() {
    this._taskUtils = new TaskUtils(optionsDefinitions, help);
  }

  async execute(cliArgs) {
    let options = this._taskUtils.parseCliArguments(cliArgs);
    this._taskUtils.testOption(options.user, "User is mandatory option.");

    let secureStoreCliCommon = await SecureStoreCliCommon.init();
    let secureStoreCnt = await secureStoreCliCommon.readSecureStore();

    let ac1 = await read({prompt: `Access code 1 for ${options.user} : `, silent: true});
    let ac2 = await read({prompt: `Access code 2 for ${options.user} : `, silent: true});

    let oidcServer = options.url;
    console.log("Trying to login using provided credentials...");
    if (await this._testLogin(ac1, ac2, oidcServer)) {
      console.log("Login has been successful.");
      secureStoreCnt[options.user] = {ac1, ac2, oidcServer};
      secureStoreCliCommon.writeSecureStore(secureStoreCnt);
      console.log(`Access code 1 and Access code 2 for user ${options.user} has been successfully stored into secure store.`);
    } else {
      console.error("Cannot login to oidc.plus4u.net. Probably invalid combination of Access Code 1 and Access Code 2.");
    }
  }

  async _testLogin(accessCode1, accessCode2, oidcServer) {
    if (accessCode1.length === 0 || accessCode2.length === 0) {
      throw `Access code cannot be empty. Ignore this error for "Prompt ad-hoc".`;
    }
    let credentials = {
      accessCode1,
      accessCode2,
      grant_type: "password"
    };
    let tokenEndpointUrl = await this._getTokenEndpoint(oidcServer);
    let resp = await r2.post(tokenEndpointUrl, {json: credentials}).json;
    if (Object.keys(resp.uuAppErrorMap).length > 0) {
      return false;
    }
    return true;
  }

  async _getTokenEndpoint(oidcServer) {
    let oidcServerConfigUrl = (oidcServer || DEFAULT_OIDC_SERVER) + "/.well-known/openid-configuration";
    let oidcConfig = await r2.get(oidcServerConfigUrl).json;
    if (Object.keys(oidcConfig.uuAppErrorMap).length > 0) {
      throw `Cannot get configuration of OIDC server on ${oidcServer}. Probably invalid URL.`;
    }
    return oidcConfig.token_endpoint;
  }

}

module.exports = AddTask;