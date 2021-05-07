const {promisify} = require('util');
const read = promisify(require("read"));
const secureStore = require("../lib/securestore");

class SecureStoreCliCommon {

  static async init(secureStoreLoc) {
    let secureStoreCliCommon = new SecureStoreCliCommon();
    secureStoreCliCommon._secureStoreLoc = secureStoreLoc;
    await secureStoreCliCommon._init();
    return secureStoreCliCommon;
  }

  async _init() {
    if (!secureStore.exists(this._secureStoreLoc)) {
      console.log("Initializing secure store.");
      let password2;
      do {
        this._password = await read({prompt: `Secure store password : `, silent: true});
        password2 = await read({prompt: `Retype Secure store password : `, silent: true});
      } while (this._password !== password2);
      secureStore.write({}, this._password, this._secureStoreLoc);
      return {};
    } else {
      this._password = await read({prompt: `Secure store password : `, silent: true});
      secureStore.read(this._password, this._secureStoreLoc);
    }
  }

  async readSecureStore() {
    return secureStore.read(this._password, this._secureStoreLoc);
  }

  async writeSecureStore(secureStoreCnt) {
    secureStore.write(secureStoreCnt, this._password, this._secureStoreLoc);
  }
}

module.exports = SecureStoreCliCommon;

