// Nodejs encryption with CTR
const cryptoVal = require('crypto');
const algorithm = 'aes-256-cbc';
//const key = cryptoVal.randomBytes(32);

const iv = cryptoVal.randomBytes(16);

export function encrypt(message:string, algorithm:string) {
    const key = Buffer.from(cryptoVal.createHash('sha512').update("secret_key").digest('hex').substring(0, 32)) 
 let cipher = cryptoVal.createCipheriv(algorithm, Buffer.from(key), iv);
 let encrypted = cipher.update(message);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

export function decrypt(message:any, algorithm:string) {
    const key = Buffer.from(cryptoVal.createHash('sha512').update("secret_key").digest('hex').substring(0, 32))
 let iv = Buffer.from((message.iv), 'hex');
 let encryptedText = Buffer.from(message.encryptedData, 'hex');
 let decipher = cryptoVal.createDecipheriv(algorithm, Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}

/*var hw = encrypt("Some serious stuff")
console.log(hw)
console.log(decrypt(hw))*/
