const TaskUtils = require("../misc/task-utils");
const SecureStoreCliCommon = require("../secure-store-cli-common");

const optionsDefinitions = [
  {
    name: "help",
    alias: "h",
    type: Boolean,
    description: "Displays this usage guide."
  }
];

const help = [
  {
    header: "ls command",
    content: "List users in the vault."
  },
  {
    header: 'Synopsis',
    content: [
      '$ oidc-plus4u-vault ls'
    ]
  },
  {
    header: 'Options',
    optionList: optionsDefinitions
  }
];

class LsTask {

  constructor() {
    this._taskUtils = new TaskUtils(optionsDefinitions, help);
  }

  async execute(cliArgs) {
    let options = this._taskUtils.parseCliArguments(cliArgs);

    let secureStoreCliCommon = await SecureStoreCliCommon.init();
    let secureStoreCnt = await secureStoreCliCommon.readSecureStore();
    let res = Object.keys(secureStoreCnt).filter(uid => secureStoreCnt[uid]).map(uid => {
      if (secureStoreCnt[uid].oidcServer) {
        return `${uid} - ${secureStoreCnt[uid].oidcServer}`;
      }
      return uid;
    }).join("\n");
    console.log(res);
  }
}

module.exports = LsTask;