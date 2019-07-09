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

    let secureStoreCliCommon = await SecureStoreCliCommon.init();
    let secureStoreCnt = await secureStoreCliCommon.readSecureStore();
    delete secureStoreCnt[options.user];
    secureStoreCliCommon.writeSecureStore(secureStoreCnt);
  }

}

module.exports = RmTask;