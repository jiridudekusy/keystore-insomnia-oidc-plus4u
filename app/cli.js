const currentDir = process.cwd();
const commandLineArgs = require("command-line-args");
const commandLineUsage = require("command-line-usage");
const AddTask = require("./tasks/add");
const RmTask = require("./tasks/rm");
const LsTask = require("./tasks/ls");
const ImportTask = require("./tasks/import");
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const sections = [
  {
    header: "oidc-plus4u-vault",
    content: "Utility tool for maintaining AES-265 encrypted file with accessCodes to oidc.plus4u.net."
  },
  {
    header: "Synopsis",
    content: [
      "oidc-plus4u-vault <command> <command parameters>"
    ]
  },
  {
    header: 'Command List',
    content: [
      { name: 'help', summary: 'Display this help.' },
      { name: 'add', summary: 'Stores user credentials to the vault.' },
      { name: 'ls', summary: 'List users in the vault.' },
      { name: 'rm', summary: 'Removes user credentials from the vault.' },
      { name: 'import', summary: 'Import credentials from external source file the vault.' }
    ]
  }
];

const keypress = async () => {
  process.stdin.setRawMode(true)
  return new Promise(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false)
    process.stdin.pause()
    resolve()
  }))
}

async function execute() {
  let notifier = updateNotifier({pkg});
  if(notifier.update && process.stdout.isTTY && notifier.update.current != notifier.update.latest){
    notifier.notify({isGlobal: true, defer: false});
    console.log("Press any key to continue...");
    await keypress();
  }

  const mainDefinitions = [
    {name: 'command', defaultOption: true}
  ];

  const mainOptions = commandLineArgs(mainDefinitions, {stopAtFirstUnknown: true});
  const argv = mainOptions._unknown || [];
  let task;
  let opts = {currentDir};
  if (mainOptions.command === "add") {
    task = new AddTask(opts);
  } else if (mainOptions.command === "rm") {
    task = new RmTask(opts);
  } else if (mainOptions.command === "ls") {
    task = new LsTask(opts);
  } else if (mainOptions.command === "import") {
    task = new ImportTask(opts);
  }

  if (!task) {
    console.error("Unknown command");
    const usage = commandLineUsage(sections);
    console.log(usage);
    return;
  }

  await task.execute(argv);
}

module.exports = execute;
