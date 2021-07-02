const TaskUtils = require("../misc/task-utils");
const HttpUtils = require("../misc/http-utils");
const OidcClient = require("../misc/oidc-client");
const AddTask = require("./add");
const SecureStoreCliCommon = require("../secure-store-cli-common");
const LineByLine = require('n-readlines');

const optionsDefinitions = [
  {
    name: "source",
    alias: "s",
    type: String,
    description: "Source file for import."
  },
  {
    name: "sourceType",
    alias: "t",
    type: String,
    defaultValue: "vault",
    description: "Type of source file - either 'vault' or 'txt' (from plus4u mall)."
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

    if (options.sourceType === "vault") {
      await this._importFromSecureStore(options);
    } else if (options.sourceType === "txt") {
      // enables load of multiple access codes stored in a text file in the copy-paste form returned in plus4u
      await this._importFromPlus4uMallResponse(options);
    } else {
      throw new Error(`Unknown sourceType ${options.sourceType}.`);
    }
  }

  async _importFromSecureStore(options) {
    console.log(`Going to read source secure store ${options.source}`);
    let sourceSecureStoreCliCommon = await this._loadVault(options.source);
    let sourceSecureStore = await sourceSecureStoreCliCommon.readSecureStore();

    console.log(`Going to import credentials to vault.`);
    if (options.file) {
      console.log(`Working with secure store on location ${options.file}`);
    } else {
      console.log(`Working with default secure store`);
    }

    let secureStoreCliCommon = await SecureStoreCliCommon.init(options.file);
    let secureStoreCnt = await secureStoreCliCommon.readSecureStore();

    console.info(`Importing ${Object.keys(sourceSecureStore).length} records...`);

    secureStoreCnt = {...secureStoreCnt, ...sourceSecureStore};
    await secureStoreCliCommon.writeSecureStore(secureStoreCnt);
    console.info(`Import finished.`);
  }

  async _loadVault(uri) {
    if (uri.toLowerCase().startsWith("http")) {
      const defaultUser = await this._getLocalUser();
      const token = await OidcClient.login(defaultUser.ac1, defaultUser.ac2, OidcClient.DEFAULT_OIDC_SERVER, uri);
      console.info(`Downloading secure store from ${uri}.`);
      const vaultBytes = await new HttpUtils(token).getResource(uri);
      return SecureStoreCliCommon.loadFromBytes(vaultBytes);
    } else {
      return SecureStoreCliCommon.init(uri);
    }
  }

  async _getLocalUser() {
    console.info(`Loading default secure store to load credentials for HTTP call.`);
    const defaultSecureStore = await SecureStoreCliCommon.init();
    let users = await defaultSecureStore.readSecureStore();
    const localUserKeys = ["you", "localUser"];
    for(const userKey of localUserKeys) {
      if (users.hasOwnProperty(userKey)) {
        return users[userKey];
      }
    }
    console.info(`Cannot find a local user with aliases (${localUserKeys}) in the default vault. Please provide credentials.`);
    await new AddTask().execute(localUserKeys[0]);
    users = await defaultSecureStore.readSecureStore();
    return users[localUserKeys[0]];
  }

  async _importFromPlus4uMallResponse(options) {
    let secureStoreCliCommon = await SecureStoreCliCommon.init(options.file);
    let secureStoreCnt = await secureStoreCliCommon.readSecureStore();

    const users = this._readUsersFromPlus4uMallResponse(options.source);
    console.info(`Loaded ${Object.keys(users).length} users from the source file ${options.source}.`);
    const oidcServer = options.oidcServer;
    for (const userId in users) {
      const user = users[userId];
      if (await OidcClient.login(user.ac1, user.ac2, oidcServer)) {
        user.oidcServer = oidcServer;
        secureStoreCnt[userId] = user;
        console.log(`Access code 1 and Access code 2 for user ${userId} has been successfully stored into secure store.`);
      } else {
        console.error(`Cannot login to oidc.plus4u.net with user ${userId}. Probably invalid combination of Access Code 1 and Access Code 2. Skipping this user...`);
      }
    }

    secureStoreCliCommon.writeSecureStore(secureStoreCnt);
  }

  _readUsersFromPlus4uMallResponse(sourceFile) {
    const users = {};
    const lineReader = new LineByLine(sourceFile);

    let lineBuf;
    while (lineBuf = lineReader.next()) {
      const line = lineBuf.toString();
      if (!(line.length === 0 || !line.trim())) {
        const parts = line.split(/[\t ]/g);
        if (parts.length === 4) {
          const user = parts[2];
          const credentials = JSON.parse(parts[3]);
          users[user] = {ac1: credentials.ac1, ac2: credentials.ac2};
        } else if (parts.length === 3) {
          const user = parts[1];
          const credentials = JSON.parse(parts[2]);
          users[user] = {ac1: credentials.ac1, ac2: credentials.ac2};
        } else {
          console.error(`Line cannot be parsed as it does not follow standard Expected 4 parts separated by tab or single space, but got ${parts.length}. Line: ${line}.`);
        }
      }
    }
    return users;
  }

}

module.exports = ImportTask;
