const {promisify} = require('util');
const read = promisify(require("read"));
const secureStore = require("../lib/securestore");

class SecureStoreCliCommon {

  static async init() {
    let secureStoreCliCommon = new SecureStoreCliCommon();
    await secureStoreCliCommon._init();
    return secureStoreCliCommon;
  }

  async _init() {
    if (!secureStore.exists()) {
      console.log("Initializing secure store.");
      let password2;
      do {
        this._password = await read({prompt: `Secure store password : `, silent: true});
        password2 = await read({prompt: `Retype Secure store password : `, silent: true});
      } while (this._password !== password2);
      secureStore.write({}, this._password);
      return {};
    } else {
      this._password = await read({prompt: `Secure store password : `, silent: true});
      secureStore.read(this._password);
    }
  }

  async readSecureStore() {
    return secureStore.read(this._password);
  }

  async writeSecureStore(secureStoreCnt) {
    secureStore.write(secureStoreCnt, this._password);
  }
}

module.exports = SecureStoreCliCommon;

