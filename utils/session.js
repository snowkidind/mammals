const crypto = require('crypto');

const apiKeyBytes = 9;
const secretBytes = 10;

module.exports = {

  /*
   * Used for inserting readable timestamps into the db from epoch date
   */
  timeFmt: (epoch) => {
    const date = new Date(epoch);
    let minutes = date.getMinutes();
    if (minutes < 10) minutes = '0' + String(minutes);
    let seconds = date.getSeconds();
    if (seconds < 10) seconds = '0' + String(seconds);
    const month = date.getMonth() + 1;
    const ms = date.getMilliseconds()
    const fullDate = (Number(date.getFullYear())) + '-' + month + '-' + date.getDate() + ' ' + date.getHours() + ':' + minutes + ':' + seconds + '.' + ms;
    return { display: fullDate, epoch: epoch }
  },

  newApiAndSecret: function () {
    return new Promise(async (resolve) => {
      const apiKey = await module.exports.randomHex(apiKeyBytes)
      const secret = await module.exports.randomHex(secretBytes)
      resolve([apiKey, secret])
    })
  },

  apiKeyIsValidLength: (apiKey) => {
    return (apiKey.length === apiKeyBytes * 2);
  },

  hashIsValidLength: (hash) => {
    return (hash.length + 1 === 20);
  },

  encodeApiKeyStrategy: async (key, secret, nonce) => {
    const enc = await module.exports.sha256(secret + ':' + nonce);
    const chop = enc.slice(0, 19);
    return module.exports.base64Encode(
      key + ':' + nonce + ':' + chop
    )
  },

  encodeSecretWithNonce: async (secret, nonce) => {
    const dbhash = await module.exports.sha256(secret + ':' + nonce);
    return dbhash.slice(0, 19);
  },

  nonceIsWithinRange: (nonce) => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    const tenMinutesAgo = now - tenMinutes;
    const tenMinutesFromNow = now + tenMinutes;
    return (nonce > tenMinutesAgo && nonce < tenMinutesFromNow)
  },

  encodeSessionCookie: async () => {
    return await module.exports.randomHex(16);
  },

  hashIsValid: (hash) => {
    return isValidHash(hash);
  },

  sha256: async (message) => {
    const hash = crypto.createHash('sha256')
    hash.update(message)
    return (hash.digest('hex'));
  },

  isBase64Encoded: (string) => {
    return isBase64(string)
  },

  base64Encode: (string) => {
    const bufferObj = Buffer.from(string, "utf8");
    return bufferObj.toString("base64");
  },

  base64Decode: (string) => {
    const bufferObj = Buffer.from(string, "base64");
    return bufferObj.toString("utf8");
  },

  randomHex: (bytes) => {
    return new Promise(async (resolve) => {
      let hex = '';
      await crypto.randomBytes(bytes, function (err, buffer) {
        hex = buffer.toString('hex')
        resolve(hex)
      });
    });
  },

}

function isValidHash(string) {
  if (string instanceof Boolean || typeof string === 'boolean') { return false }
  if (string === '') { return false }
  const regex = /^[0-9a-z]*$/g
  return (new RegExp(regex).test(string))
}

function isBase64(string) {
  if (string instanceof Boolean || typeof string === 'boolean') { return false }
  if (string === '') { return false }
  const regex = /^[0-9A-Za-z_=]*$/g
  return (new RegExp(regex).test(string))
}