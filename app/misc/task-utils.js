const commandLineUsage = require("command-line-usage");
const commandLineArgs = require("command-line-args");

class TaskUtils {

  constructor(optionsDefinition, help){
    this._optionsDefinition = optionsDefinition;
    this._help = help;
  }

  parseCliArguments(cliArgs) {
    let options = commandLineArgs(this._optionsDefinition, {argv: cliArgs});
    if (options.help) {
      this.printHelpAndExit();
    }
    return options;
  }

  printHelpAndExit(exitCode = 0) {
    let usage = commandLineUsage(this._help);
    console.log(usage);
    process.exit(exitCode);
  }

  testOption(test, errorMessage){
    if(!test){
      this.printOtionsErrorAndExit(errorMessage);
    }
  }

  printOtionsErrorAndExit(errorMessage){
    console.error(errorMessage);
    this.printHelpAndExit(2);
  }

}

module.exports = TaskUtils;