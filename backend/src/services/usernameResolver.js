function isInitName(value) {
  return /^[a-z0-9][a-z0-9-]{1,31}\.init$/i.test(value || "");
}

function fakeAddress(name) {
  let hex = "";
  const normalized = name.toLowerCase();
  for (let i = 0; i < normalized.length; i += 1) {
    hex += normalized.charCodeAt(i).toString(16);
  }
  return `0x${hex.padEnd(40, "0").slice(0, 40)}`;
}

async function resolveInitUsername(username) {
  if (!isInitName(username)) {
    const error = new Error("Invalid .init username");
    error.statusCode = 400;
    throw error;
  }

  return {
    username,
    address: fakeAddress(username),
    source: "mock-initia-name-service",
  };
}

module.exports = { resolveInitUsername, isInitName };