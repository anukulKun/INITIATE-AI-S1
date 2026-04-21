const path = require("path");
require("dotenv").config();

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3002),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "dev_jwt_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",
  encryptionKey: process.env.ENCRYPTION_KEY || "dev_encryption_key_32_bytes_long__",
  dbPath: process.env.DB_PATH
    ? path.resolve(process.cwd(), process.env.DB_PATH)
    : path.resolve(process.cwd(), "db", "unified.db"),
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  initiaRpcUrl: process.env.INITIA_RPC_URL || "",
  initiaChainId: Number(process.env.INITIA_CHAIN_ID || 0),
  deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY || "",
  initiateContractAddress: process.env.INITIATE_AI_S1_CONTRACT_ADDRESS || "",
};
