const TaskUtils = require("../misc/task-utils");
const SecureStoreCliCommon = require("../secure-store-cli-common");

const optionsDefinitions = [
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

    if (options.file) {
      console.log(`Working with secure store on location ${options.file}`);
    }else{
      console.log(`Working with default secure store`);
    }


    let secureStoreCliCommon = await SecureStoreCliCommon.init(options.file);
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
