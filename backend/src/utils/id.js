const { randomUUID } = require("crypto");

function makeId(prefix) {
  return `${prefix}_${randomUUID()}`;
}

module.exports = { makeId };