const CryptoJS = require('crypto-js')
const secretKey = 'helloworld'
function decrypt (key) {
  var decryptedBytes = CryptoJS.AES.decrypt(key, secretKey);
  var decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedMessage
}
function encrypt(key) {
  let encryptedMessage = CryptoJS.AES.encrypt(key, secretKey).toString()
  return encryptedMessage
}
exports.decrypt = decrypt
exports.encrypt = encrypt