const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const config = require("../config");

function keyBuffer() {
  return crypto.createHash("sha256").update(config.encryptionKey).digest();
}

function encrypt(text) {
  if (!text) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuffer(), iv);
  const payload = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${payload.toString("hex")}`;
}

function decrypt(cipherText) {
  if (!cipherText) return "";
  const [ivHex, tagHex, payloadHex] = cipherText.split(":");
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuffer(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const output = Buffer.concat([decipher.update(Buffer.from(payloadHex, "hex")), decipher.final()]);
  return output.toString("utf8");
}

function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { encrypt, decrypt, hashPassword, comparePassword };