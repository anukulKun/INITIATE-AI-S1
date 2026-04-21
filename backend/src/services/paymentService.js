const { randomUUID } = require("crypto");
const { ethers } = require("ethers");
const config = require("../config");

const hasChainConfig =
  Boolean(config.initiaRpcUrl) &&
  Boolean(config.deployerPrivateKey) &&
  Boolean(config.initiateContractAddress);

const initiateAbi = [
  "function sendTransfer(address recipient, string remark) payable returns (uint256)",
  "function claimTransfer(uint256 transferId)",
  "function refundTransfer(uint256 transferId)",
  "function createGroup(address beneficiary, uint256 target, string description) returns (uint256)",
  "function contributeToGroup(uint256 groupId) payable",
  "function createPot(string label, uint256 target, bool yieldEnabled) returns (uint256)",
  "function depositToPot(uint256 potId) payable",
  "function withdrawFromPot(uint256 potId, uint256 amount)",
  "function closePot(uint256 potId)",
];

let signer;
let contract;
if (hasChainConfig) {
  const provider = new ethers.JsonRpcProvider(config.initiaRpcUrl, config.initiaChainId || undefined);
  signer = new ethers.Wallet(config.deployerPrivateKey, provider);
  contract = new ethers.Contract(config.initiateContractAddress, initiateAbi, signer);
}

function fakeTxHash(tag) {
  return `0x${Buffer.from(`${tag}-${randomUUID()}`).toString("hex").slice(0, 64).padEnd(64, "0")}`;
}

async function sendTransfer({ recipient, amountWei, remark }) {
  if (!contract) return { txHash: fakeTxHash("transfer"), status: "submitted-mock" };
  const tx = await contract.sendTransfer(recipient, remark || "", { value: amountWei });
  await tx.wait();
  return { txHash: tx.hash, status: "confirmed" };
}

async function createGroup({ beneficiary, amountWei, description }) {
  if (!contract) return { txHash: fakeTxHash("group-create"), status: "submitted-mock" };
  const tx = await contract.createGroup(beneficiary, amountWei, description || "");
  await tx.wait();
  return { txHash: tx.hash, status: "confirmed" };
}

async function contributeGroup({ groupId, amountWei }) {
  if (!contract) return { txHash: fakeTxHash("group-contrib"), status: "submitted-mock" };
  const tx = await contract.contributeToGroup(groupId, { value: amountWei });
  await tx.wait();
  return { txHash: tx.hash, status: "confirmed" };
}

async function createPot({ label, targetAmountWei, yieldEnabled }) {
  if (!contract) return { txHash: fakeTxHash("pot-create"), status: "submitted-mock" };
  const tx = await contract.createPot(label, targetAmountWei, Boolean(yieldEnabled));
  await tx.wait();
  return { txHash: tx.hash, status: "confirmed" };
}

async function depositPot({ potId, amountWei }) {
  if (!contract) return { txHash: fakeTxHash("pot-deposit"), status: "submitted-mock" };
  const tx = await contract.depositToPot(potId, { value: amountWei });
  await tx.wait();
  return { txHash: tx.hash, status: "confirmed" };
}

async function withdrawPot({ potId, amountWei }) {
  if (!contract) return { txHash: fakeTxHash("pot-withdraw"), status: "submitted-mock" };
  const tx = amountWei ? await contract.withdrawFromPot(potId, amountWei) : await contract.closePot(potId);
  await tx.wait();
  return { txHash: tx.hash, status: "confirmed" };
}

module.exports = {
  sendTransfer,
  createGroup,
  contributeGroup,
  createPot,
  depositPot,
  withdrawPot,
};
