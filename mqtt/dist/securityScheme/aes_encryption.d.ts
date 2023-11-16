declare const cryptoVal: any;
declare const algorithm = "aes-256-cbc";
declare const key: any;
declare const iv: any;
declare function encrypt(message: string): {
    iv: any;
    encryptedData: any;
};
declare function decrypt(message: any): any;
declare var hw: {
    iv: any;
    encryptedData: any;
};
//# sourceMappingURL=aes_encryption.d.ts.map