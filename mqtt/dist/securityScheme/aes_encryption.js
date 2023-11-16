"use strict";
// Nodejs encryption with CTR
const cryptoVal = require('crypto');
const algorithm = 'aes-256-cbc';
const key = cryptoVal.randomBytes(32);
const iv = cryptoVal.randomBytes(16);
function encrypt(message) {
    let cipher = cryptoVal.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(message);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}
function decrypt(message) {
    let iv = Buffer.from(message.iv, 'hex');
    let encryptedText = Buffer.from(message.encryptedData, 'hex');
    let decipher = cryptoVal.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
var hw = encrypt("Some serious stuff");
console.log(hw);
console.log(decrypt(hw));
//# sourceMappingURL=aes_encryption.js.map