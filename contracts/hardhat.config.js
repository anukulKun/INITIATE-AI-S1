require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
    },
    initia_testnet: {
      url: "http://localhost:8545",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 207170159898403,
      gasPrice: 0,
    },
  },
};

