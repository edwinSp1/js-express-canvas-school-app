const CryptoJS = require('crypto-js')
const db = require('./db')
async function getCanvasKey (username) {
  var userData = await db.getDoc('users', 'userdata', {username: username})
  const canvasKey = userData.canvasKey ?? 'no key'
  return decrypt(canvasKey)
}
// Implement encryption
var secretKey = 'helloworld' //NOT the real encryption key
function decrypt (key) {
  let decryptedBytes = CryptoJS.AES.decrypt(key, secretKey);
  let decryptedMessage = decryptedBytes.toString(CryptoJS.enc.Utf8);
  return decryptedMessage
}
function encrypt(key) {
  let encryptedMessage = CryptoJS.AES.encrypt(key, secretKey).toString()

  // Implement decryption
  return encryptedMessage
}

exports.decrypt = decrypt
exports.encryptKey = encrypt
exports.getCanvasKey = getCanvasKey