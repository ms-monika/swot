
let crypto = require('crypto');

// Digest Authentication
export function cryptoUsingMD5(data: any) {
    return crypto.createHash('md5').update(data).digest('hex');
}

export function cryptoUsingSHA256(data: any) {
    return crypto.createHash('sha256').update(data).digest('base64');
}

export function parseAuthenticationInfo(authData: any) {
    let authenticationObj: any = {};
    authData.split(', ').forEach(function (d: any) {
        d = d.split('=');
        authenticationObj[d[0]] = d[1].replace(/"/g, '');
    });
    return authenticationObj;
}
export function digestAuth(credential_digest: any, requestMethod:string, algorithm: string, authInfo: any): Boolean {
    let resp;
    let digestAuthObject: any = {};
    if (algorithm == "MD5") {
        digestAuthObject.ha1 = cryptoUsingMD5(authInfo.username + ':' + credential_digest.realm + ':' + credential_digest.password);
        digestAuthObject.ha2 = cryptoUsingMD5(requestMethod + ':' + authInfo.uri);
        resp = cryptoUsingMD5([digestAuthObject.ha1, authInfo.nonce, authInfo.nc, authInfo.cnonce, authInfo.qop, digestAuthObject.ha2].join(':'));

    } else {
        digestAuthObject.ha1 = cryptoUsingSHA256(authInfo.username + ':' + credential_digest.realm + ':' + credential_digest.password);
        digestAuthObject.ha2 = cryptoUsingSHA256(requestMethod + ':' + authInfo.uri);
        resp = cryptoUsingSHA256([digestAuthObject.ha1, authInfo.nonce, authInfo.nc, authInfo.cnonce, authInfo.qop, digestAuthObject.ha2].join(':'));

    }

    return resp;
}