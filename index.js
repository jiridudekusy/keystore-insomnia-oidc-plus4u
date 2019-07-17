#!/usr/bin/env node
// to enable mocks
const vaultCli = require("./app/cli");

vaultCli()
.then(() => {
}).catch(e => {
  console.log(`Error in application : ${e} stacktrace: ${e.stack}`);
});