'use strict';

const crypto = require("crypto");

const IV_LENGTH = 16; // For AES, this is always 16

function _createKey(password, stages) {
    let derivedKey = password;
    let metadata = [];
    for (let stage of stages) {
        if (stage.type === "hmac") {
            derivedKey = crypto.createHmac(stage.parameters.algorithm, derivedKey).digest();
            metadata.push(stage);
        }
        if (stage.type === "scrypt") {
            let salt;
            if(!stage.parameters.salt){
                salt = crypto.randomBytes(stage.parameters.saltLength);
                stage.parameters.salt = salt.toString("base64");
            }else{
                salt = Buffer.from(stage.parameters.salt, "base64");
            }

            derivedKey = crypto.scryptSync(derivedKey, salt, stage.parameters.keylen, stage.parameters.options);

            metadata.push(stage);
        }
    }
    return {
        metadata,
        derivedKey: Buffer.from(derivedKey)
    };
}

function encrypt(text, password) {
    let stages = [
        {
            type: "scrypt",
            parameters: {
                saltLength: 128,
                keylen: 32,
                options: {
                    N: 16384, //1048576, //cost
                    r: 8, //blockSize
                    p: 1
                }
            }
        },
        {
            type: "hmac",
            parameters: {
                algorithm: "sha256"
            }
        }
    ]
    let key = _createKey(password, stages);
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-ctr', key.derivedKey, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    let metadata = {
        algorithm: "aes-256-ctr",
        parameters: {
            iv: iv.toString("base64")
        },
        derivedKeyMetadata: key.metadata
    }
    return Buffer.from(JSON.stringify(metadata)).toString("base64") + ':' + encrypted.toString("base64");
}

function decrypt(text, password) {
    let textParts = text.split(':');
    let metadata = JSON.parse(Buffer.from(textParts[0], "base64").toString());
    let encryptedText = Buffer.from(textParts[1], "base64");
    let decryptedString;
    if (metadata.algorithm === "aes-256-ctr") {
        let iv = Buffer.from(metadata.parameters.iv, "base64");
        let decipher = crypto.createDecipheriv('aes-256-ctr', _createKey(password, metadata.derivedKeyMetadata).derivedKey, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        decryptedString = decrypted.toString();
    } else {
        throw `Algorithm ${metadata.algorithm} is not supported, update to latest version of vault.`;
    }
    return decryptedString;
}

// function _descryptInternal(text, )

module.exports = {decrypt, encrypt};
