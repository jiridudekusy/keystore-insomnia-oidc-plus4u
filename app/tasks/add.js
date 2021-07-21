const TaskUtils = require("../misc/task-utils");
const OidcClient = require("../misc/oidc-client");
const SecureStoreCliCommon = require("../secure-store-cli-common");
const { promisify } = require('util');
const read = promisify(require("read"));

const optionsDefinitions = [
  {
    name: "user",
    type: String,
    defaultOption: true,
    typeLabel: "{underline user uid}",
    description: "Default option. UID of user(human or uuEE) or alias such as 'you'."
  },
  {
    name: "alias",
    alias: "a",
    type: String,
    multiple: true,
    typeLabel: "{underline alias for the user}",
    description: "Optional alias for the user. The user will be stored under these alias as well. Multiple values supported."
  },
  {
    name: "skipTest",
    type: Boolean,
    description: "Skip authentication test. Useful for storing keys for http basic auth."
  },
  {
    name: "url",
    type: String,
    typeLabel: "{underline oidc url}",
    description: "URL to the OIDC server. If not set, defaults to " + OidcClient.DEFAULT_OIDC_SERVER + "."
  },
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Displays this usage guide."
  },
  {
    name: "file",
    alias: "f",
    type: String,
    description: "Path to vault file. This is useful if you want to manage project vault which other members of the team can import."
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
    if (options.file) {
      console.log(`Working with secure store on location ${options.file}`);
    } else {
      console.log(`Working with default secure store`);
    }

    let secureStoreCliCommon = await SecureStoreCliCommon.init(options.file);
    let secureStoreCnt = await secureStoreCliCommon.readSecureStore();

    let ac1 = await read({ prompt: `Access code 1 for ${options.user} : `, silent: true });
    let ac2 = await read({ prompt: `Access code 2 for ${options.user} : `, silent: true });

    if (!options.skipTest) {
      let oidcServer = options.url;
      console.log("Trying to login using provided credentials...");
      if (await OidcClient.login(ac1, ac2, oidcServer)) {
        console.log("Login has been successful.");
        secureStoreCnt[options.user] = { ac1, ac2, oidcServer };
        if (Array.isArray(options.alias)) {
          for (const alias of options.alias) {
            secureStoreCnt[alias] = { ac1, ac2, oidcServer };
          }
        }
        secureStoreCliCommon.writeSecureStore(secureStoreCnt);
        console.log(`Access code 1 and Access code 2 for user ${options.user} has been successfully stored into secure store.`);
      } else {
        console.error("Cannot login to oidc.plus4u.net. Probably invalid combination of Access Code 1 and Access Code 2.");
      }
    }else{
      console.log("Skip login test.");
      console.log(`Access code 1 and Access code 2 for user ${options.user} has been successfully stored into secure store.`);
    }

  }
}

module.exports = AddTask;
