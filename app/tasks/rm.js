const TaskUtils = require("../misc/task-utils");
const SecureStoreCliCommon = require("../secure-store-cli-common");

const optionsDefinitions = [
  {
    name: "user",
    type: String,
    defaultOption:true,
    typeLabel: "{underline user uid}",
    description: "Default option. UID of user(human or uuEE) or alias such as 'you'."
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
    header: "rm command",
    content: "Removes user credentials from the vault."
  },
  {
    header: 'Synopsis',
    content: '$ oidc-plus4u-vault rm {underline user}'
  },
  {
    header: 'Options',
    optionList: optionsDefinitions
  }
];

class RmTask {

  constructor() {
    this._taskUtils = new TaskUtils(optionsDefinitions, help);
  }

  async execute(cliArgs) {
    let options = this._taskUtils.parseCliArguments(cliArgs);
    this._taskUtils.testOption(options.user, "User is mandatory option.");

    if (options.file) {
      console.log(`Working with secure store on location ${options.file}`);
    }else{
      console.log(`Working with default secure store`);
    }


    let secureStoreCliCommon = await SecureStoreCliCommon.init(options.file);
    let secureStoreCnt = await secureStoreCliCommon.readSecureStore();
    delete secureStoreCnt[options.user];
    secureStoreCliCommon.writeSecureStore(secureStoreCnt);
  }

}

module.exports = RmTask;
