const TaskUtils = require("../misc/task-utils");
const SecureStoreCliCommon = require("../secure-store-cli-common");
const {promisify} = require('util');
const read = promisify(require("read"));
const r2 = require("r2");

const optionsDefinitions = [
  {
    name: "source",
    alias: "s",
    type: String,
    description: "Source file for import."
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
    header: "import command",
    content: "Import user credentials from source file."
  },
  {
    header: 'Synopsis',
    content: [
      '$ oidc-plus4u-vault import -s {underline source file}'
    ]
  },
  {
    header: 'Options',
    optionList: optionsDefinitions
  }
];

class ImportTask {

  constructor() {
    this._taskUtils = new TaskUtils(optionsDefinitions, help);
  }

  async execute(cliArgs) {
    let options = this._taskUtils.parseCliArguments(cliArgs);
    this._taskUtils.testOption(options.source, "Source is mandatory option.");
    console.log(`Going to read source secure store ${options.source}`);
    let sourceSecureStoreCliCommon = await SecureStoreCliCommon.init(options.source);
    let sourceSecureStore = await sourceSecureStoreCliCommon.readSecureStore();

    console.log(`Going to import credentials to vault.`);
    if (options.file) {
      console.log(`Working with secure store on location ${options.file}`);
    }else{
      console.log(`Working with default secure store`);
    }

    let secureStoreCliCommon = await SecureStoreCliCommon.init(options.file);
    let secureStoreCnt = await secureStoreCliCommon.readSecureStore();

    secureStoreCnt = {...secureStoreCnt, ...sourceSecureStore};
    await secureStoreCliCommon.writeSecureStore(secureStoreCnt);
  }

}

module.exports = ImportTask;
