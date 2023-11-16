"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.digestAuth = exports.parseAuthenticationInfo = exports.cryptoUsingSHA256 = exports.cryptoUsingMD5 = void 0;
let crypto = require('crypto');
// Digest Authentication
function cryptoUsingMD5(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}
exports.cryptoUsingMD5 = cryptoUsingMD5;
function cryptoUsingSHA256(data) {
    return crypto.createHash('sha256').update(data).digest('base64');
}
exports.cryptoUsingSHA256 = cryptoUsingSHA256;
function parseAuthenticationInfo(authData) {
    let authenticationObj = {};
    authData.split(', ').forEach(function (d) {
        d = d.split('=');
        authenticationObj[d[0]] = d[1].replace(/"/g, '');
    });
    return authenticationObj;
}
exports.parseAuthenticationInfo = parseAuthenticationInfo;
function digestAuth(credential_digest, requestMethod, algorithm, authInfo) {
    let resp;
    let digestAuthObject = {};
    if (algorithm == "MD5") {
        digestAuthObject.ha1 = cryptoUsingMD5(authInfo.username + ':' + credential_digest.realm + ':' + credential_digest.password);
        digestAuthObject.ha2 = cryptoUsingMD5(requestMethod + ':' + authInfo.uri);
        resp = cryptoUsingMD5([digestAuthObject.ha1, authInfo.nonce, authInfo.nc, authInfo.cnonce, authInfo.qop, digestAuthObject.ha2].join(':'));
    }
    else {
        digestAuthObject.ha1 = cryptoUsingSHA256(authInfo.username + ':' + credential_digest.realm + ':' + credential_digest.password);
        digestAuthObject.ha2 = cryptoUsingSHA256(requestMethod + ':' + authInfo.uri);
        resp = cryptoUsingSHA256([digestAuthObject.ha1, authInfo.nonce, authInfo.nc, authInfo.cnonce, authInfo.qop, digestAuthObject.ha2].join(':'));
    }
    return resp;
}
exports.digestAuth = digestAuth;
//# sourceMappingURL=digest.js.map