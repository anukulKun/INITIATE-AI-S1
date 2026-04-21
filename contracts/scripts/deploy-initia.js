/**
 * deploy-initia.js
 *
 * Deploys INITIATEAIS1Core to the target Initia network.
 * Outputs a JSON artifact with all deployment info needed for submission.json.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-initia.js --network initia_testnet
 *   npx hardhat run scripts/deploy-initia.js --network initia_appchain
 */

const { ethers, network } = require("hardhat");
const fs   = require("fs");
const path = require("path");

async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  INITIATEAIS1Core — Initia Deployment");
  console.log("═══════════════════════════════════════════════════\n");

  // ── 1. Signer info ──────────────────────────────────────────────
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log(`Network:          ${network.name}`);
  console.log(`Chain ID:         ${network.config.chainId}`);
  console.log(`Deployer:         ${deployerAddress}`);
  console.log(`Deployer balance: ${ethers.formatEther(balance)} INIT\n`);

  if (balance === 0n) {
    throw new Error(
      "Deployer has zero balance. Fund it from the Initia testnet faucet first.\n" +
      "Faucet: https://faucet.testnet.initia.xyz"
    );
  }

  // ── 2. Deploy ───────────────────────────────────────────────────
  const chainId = network.config.chainId;
  if (!chainId || chainId === 0) {
    throw new Error("INITIA_CHAIN_ID (or APPCHAIN_CHAIN_ID) is not set in your .env");
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
  const onChainChainId   = await contract.ALLOWED_CHAIN_ID();
  const onChainOwner     = await contract.owner();

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
    network:         network.name,
    chainId:         chainId,
    contractAddress: contractAddress,
    deploymentTx:    deployTx.hash,
    deployerAddress: deployerAddress,
    timestamp:       new Date().toISOString(),
    blockNumber:     deployTx.blockNumber ?? "pending",
  };

  const outDir      = path.join(__dirname, "..", "deployments");
  const outFile     = path.join(outDir, `${network.name}.json`);
  const submFile    = path.join(__dirname, "..", ".initia", "submission.json");
  const submDir     = path.join(__dirname, "..", ".initia");

  fs.mkdirSync(outDir,  { recursive: true });
  fs.mkdirSync(submDir, { recursive: true });

  fs.writeFileSync(outFile, JSON.stringify(artifact, null, 2));
  console.log(`Deployment artifact written to: deployments/${network.name}.json`);

  // ── 5. Write/update submission.json ────────────────────────────
  const submission = {
    project_name: "INITIATE AI S1",
    track: ["DeFi", "AI"],
    chain_id:         chainId.toString(),
    contract_address: contractAddress,
    deployment_tx:    deployTx.hash,
    deployer_address: deployerAddress,
    interwovenkit:    true,
    initia_native_features: [
      "init_usernames",
      "interwoven_bridge",
      "auto_signing_session_ux"
    ],
    demo_video: "https://youtube.com/REPLACE_ME",
    github:     "https://github.com/REPLACE_ME",
  };

  fs.writeFileSync(submFile, JSON.stringify(submission, null, 2));
  console.log(`submission.json written to:     .initia/submission.json\n`);

  // ── 6. Print copy-paste summary ────────────────────────────────
  console.log("════ COPY THIS INTO YOUR NOTES ════════════════════");
  console.log(`deployed address : ${contractAddress}`);
  console.log(`deployment tx    : ${deployTx.hash}`);
  console.log(`chain ID         : ${chainId}`);
  console.log(`deployer address : ${deployerAddress}`);
  console.log("════════════════════════════════════════════════════\n");

  return artifact;
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exitCode = 1;
});

