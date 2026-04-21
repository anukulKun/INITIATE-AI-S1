/**
 * deploy.js
 *
 * Deploys INITIATEAIS1Core to the target network (Sepolia or Initia).
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.js --network sepolia
 *   npx hardhat run scripts/deploy.js --network initia_testnet
 */

const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  INITIATEAIS1Core — Smart Contract Deployment");
  console.log("═══════════════════════════════════════════════════\n");

  // ── 1. Signer info ──────────────────────────────────────────────
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log(`Network:          ${network.name}`);
  console.log(`Chain ID:         ${network.config.chainId}`);
  console.log(`Deployer:         ${deployerAddress}`);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    throw new Error(
      "Deployer has zero balance. Fund the account with test ETH first."
    );
  }

  // ── 2. Deploy ───────────────────────────────────────────────────
  const chainId = network.config.chainId;
  if (!chainId || chainId === 0) {
    throw new Error("Chain ID is not set in hardhat.config.js");
  }

  console.log("Deploying INITIATEAIS1Core...");
  const Factory = await ethers.getContractFactory("INITIATEAIS1Core");

  // Constructor arg: the chain ID to lock this contract to
  const contract = await Factory.deploy(chainId);
  const deployTx = contract.deploymentTransaction();

  console.log(`Deploy tx hash:   ${deployTx.hash}`);
  console.log("Waiting for confirmation...\n");

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  // ── 3. Verify constructor values ───────────────────────────────
  const onChainChainId = await contract.ALLOWED_CHAIN_ID();
  const onChainOwner = await contract.owner();

  console.log("═══════════════════════════════════════════════════");
  console.log("  Deployment successful!");
  console.log("═══════════════════════════════════════════════════");
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Deploy tx hash:   ${deployTx.hash}`);
  console.log(`Chain ID (guard): ${onChainChainId.toString()}`);
  console.log(`Owner:            ${onChainOwner}`);
  console.log("═══════════════════════════════════════════════════\n");

  // ── 4. Write artifact ──────────────────────────────────────────
  const artifact = {
    network: network.name,
    chainId: chainId,
    contractAddress: contractAddress,
    deploymentTx: deployTx.hash,
    deployerAddress: deployerAddress,
    timestamp: new Date().toISOString(),
    blockNumber: deployTx.blockNumber ?? "pending",
  };

  const outDir = path.join(__dirname, "..", "deployments");
  const outFile = path.join(outDir, `${network.name}.json`);

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(artifact, null, 2));
  console.log(`Deployment artifact written to: deployments/${network.name}.json\n`);

  return artifact;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
