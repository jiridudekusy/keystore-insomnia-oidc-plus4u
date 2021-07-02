const r2 = require("r2");

class HttpUtils {

  constructor(token) {
    this._token = token;
  }

  async getResource(uri) {
    let headers = {
      contentDisposition: "attachment"
    };
    if (this._token) {
      headers.authorization = `Bearer ${this._token}`;
    }
    let resp = await r2(uri, {headers}).response;
    if (resp.status !== 200) {
      throw new Error(`Cannot load resource ${uri}. HTTP status: ${resp.status} - ${resp.statusText}. Response text: ${await resp.text()}.`);
    }
    const data = await resp.arrayBuffer();
    return Buffer.from(data);
  }

}

module.exports = HttpUtils;