const {promisify} = require('util');
const read = require("read");
const secureStore = require("../lib/securestore");

class SecureStoreCliCommon {
  // cache instances to avoid asking the user for the same password again
  static _instances = {};

  static async init(secureStoreLoc) {
    if(SecureStoreCliCommon._instances.hasOwnProperty(secureStoreLoc)) {
      return SecureStoreCliCommon._instances[secureStoreLoc];
    }
    let secureStoreCliCommon = new SecureStoreCliCommon();
    secureStoreCliCommon._secureStoreLoc = secureStoreLoc;
    await secureStoreCliCommon._init();
    SecureStoreCliCommon._instances[secureStoreLoc] = secureStoreCliCommon;
    return secureStoreCliCommon;
  }

  static async loadFromBytes(bytes) {
    let secureStoreCliCommon = new SecureStoreCliCommon();
    secureStoreCliCommon._secureStoreBytes = bytes;
    await secureStoreCliCommon._init();
    return secureStoreCliCommon;
  }

  async _init() {
    const storeId = this._secureStoreLoc ? this._secureStoreLoc : "default";
    if (this._secureStoreBytes) {
      this._readOnly = true;
      this._password = await read({prompt: `Secure store password: `, silent: true});
      secureStore.readFromBytes(this._password, this._secureStoreBytes);
    } else if (!secureStore.exists(this._secureStoreLoc)) {
      console.log(`Initializing secure store (${storeId}).`);
      let password2;
      do {
        this._password = await read({prompt: `Secure store password (${storeId}): `, silent: true});
        password2 = await read({prompt: `Retype Secure store password (${storeId}): `, silent: true});
      } while (this._password !== password2);
      secureStore.write({}, this._password, this._secureStoreLoc);
    } else {
      this._password = await read({prompt: `Secure store password (${storeId}): `, silent: true});
      secureStore.read(this._password, this._secureStoreLoc);
    }
  }

  async readSecureStore() {
    return this._secureStoreBytes
        ? secureStore.readFromBytes(this._password, this._secureStoreBytes)
        : secureStore.read(this._password, this._secureStoreLoc);
  }

  async writeSecureStore(secureStoreCnt) {
    if (this._readOnly) {
      throw new Error("This secure store is read-only. Cannot write to it.");
    }
    secureStore.write(secureStoreCnt, this._password, this._secureStoreLoc);
  }

}

module.exports = SecureStoreCliCommon;

