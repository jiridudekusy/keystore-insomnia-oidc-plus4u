const r2 = require("r2");

class OidcClient {
  static DEFAULT_OIDC_SERVER = "https://uuidentity.plus4u.net/uu-oidc-maing02/bb977a99f4cc4c37a2afce3fd599d0a7/oidc";
  static DEFAULT_SCOPE = "openid";

  static async login(accessCode1, accessCode2, oidcServer, scope) {
    if (accessCode1.length === 0 || accessCode2.length === 0) {
      throw new Error(`Access codes cannot be empty.`);
    }
    if (scope && !scope.match(OidcClient.DEFAULT_SCOPE)) {
      scope += " " + this.DEFAULT_SCOPE;
    }
    let credentials = {
      accessCode1,
      accessCode2,
      scope,
      grant_type: "password"
    };
    let tokenEndpointUrl = await OidcClient._getTokenEndpoint(oidcServer);
    let resp = await r2.post(tokenEndpointUrl, {json: credentials}).json;
    if (Object.keys(resp.uuAppErrorMap).length > 0) {
      return null;
    }
    return resp.id_token;
  }

  static async _getTokenEndpoint(oidcServer) {
    let oidcServerConfigUrl = (oidcServer || OidcClient.DEFAULT_OIDC_SERVER) + "/.well-known/openid-configuration";
    let oidcConfig = await r2.get(oidcServerConfigUrl).json;
    if (Object.keys(oidcConfig.uuAppErrorMap).length > 0) {
      throw new Error(`Cannot get configuration of OIDC server on ${oidcServer}. Probably invalid URL.`);
    }
    return oidcConfig.token_endpoint;
  }
}

module.exports = OidcClient;