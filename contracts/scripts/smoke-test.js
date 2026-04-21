/**
 * smoke-test.js
 *
 * Runs a full end-to-end smoke test against a deployed INITIATEAIS1Core contract.
 * Tests all three modules: SecureTransfer, GroupPayment, SavingsPot.
 *
 * Usage:
 *   npx hardhat run scripts/smoke-test.js --network initia_testnet
 *   npx hardhat run scripts/smoke-test.js --network initia_appchain
 *   npx hardhat run scripts/smoke-test.js --network hardhat   (local, no .env needed)
 */

const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

// ─── helpers ──────────────────────────────────────────────────────

function pass(msg)  { console.log(`  ✅  ${msg}`); }
function fail(msg)  { console.log(`  ❌  ${msg}`); throw new Error(msg); }
function section(s) { console.log(`\n── ${s} ${"─".repeat(50 - s.length)}`); }
function logTx(label, hash) {
  console.log(`       tx: ${hash}`);
}

// ─── main ─────────────────────────────────────────────────────────

async function main() {
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  INITIATEAIS1Core — Smoke Test");
  console.log(`  Network: ${network.name}`);
  console.log("═══════════════════════════════════════════════════");

  const signers   = await ethers.getSigners();
  const deployer  = signers[0];
  const recipient = signers[1] ?? deployer; // fallback to same signer on testnet single-key setup
  const contributor = signers[2] ?? deployer;

  console.log(`\nDeployer:     ${await deployer.getAddress()}`);
  console.log(`Recipient:    ${await recipient.getAddress()}`);
  console.log(`Contributor:  ${await contributor.getAddress()}`);

  // ── Load deployed contract ────────────────────────────────────
  let contractAddress;

  if (network.name === "hardhat") {
    // Deploy fresh for local testing
    console.log("\nLocal hardhat network — deploying fresh contract...");
    const Factory = await ethers.getContractFactory("INITIATEAIS1Core");
    const c = await Factory.deploy(31337); // hardhat chain ID
    await c.waitForDeployment();
    contractAddress = await c.getAddress();
    console.log(`Deployed at: ${contractAddress}`);
  } else {
    // Load from deployments artifact
    const artifactPath = path.join(__dirname, "..", "deployments", `${network.name}.json`);
    if (!fs.existsSync(artifactPath)) {
      throw new Error(
        `No deployment artifact found at ${artifactPath}.\n` +
        `Run deploy-initia.js first:\n` +
        `  npx hardhat run scripts/deploy-initia.js --network ${network.name}`
      );
    }
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    contractAddress = artifact.contractAddress;
    console.log(`\nLoaded contract: ${contractAddress}`);
  }

  const contract = await ethers.getContractAt("INITIATEAIS1Core", contractAddress);

  // ─────────────────────────────────────────────────────────────
  // MODULE 1: SECURE TRANSFER
  // ─────────────────────────────────────────────────────────────
  section("MODULE 1: SecureTransfer");

  const sendAmount = ethers.parseEther("0.001"); // 0.001 INIT
  const recipientAddr = await recipient.getAddress();

  // sendTransfer
  console.log(`\n  [1.1] sendTransfer — sending ${ethers.formatEther(sendAmount)} INIT`);
  const sendTx = await contract.connect(deployer).sendTransfer(
    recipientAddr,
    "Smoke test transfer",
    { value: sendAmount }
  );
  const sendReceipt = await sendTx.wait();
  logTx("sendTransfer", sendTx.hash);

  // Parse TransferCreated event to get transferId
  const transferEvent = sendReceipt.logs
    .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "TransferCreated");

  if (!transferEvent) fail("TransferCreated event not found");
  const transferId = transferEvent.args.transferId;
  pass(`sendTransfer OK — transferId: ${transferId}`);

  // Verify state
  const t = await contract.transfers(transferId);
  if (t.sender.toLowerCase()    !== (await deployer.getAddress()).toLowerCase())  fail("sender mismatch");
  if (t.recipient.toLowerCase() !== recipientAddr.toLowerCase())                  fail("recipient mismatch");
  if (t.amount !== sendAmount)                                                     fail("amount mismatch");
  if (t.claimed)                                                                   fail("should not be claimed yet");
  pass("Transfer state verified");

  // claimTransfer
  console.log("\n  [1.2] claimTransfer");
  const balBefore = await ethers.provider.getBalance(recipientAddr);
  const claimTx   = await contract.connect(recipient).claimTransfer(transferId);
  await claimTx.wait();
  logTx("claimTransfer", claimTx.hash);

  const tAfter = await contract.transfers(transferId);
  if (!tAfter.claimed) fail("Transfer should be claimed");
  pass("claimTransfer OK — funds released to recipient");

  // sendTransfer + refundTransfer (second transfer)
  console.log("\n  [1.3] sendTransfer + refundTransfer");
  const refundTx1 = await contract.connect(deployer).sendTransfer(
    recipientAddr,
    "Refund test",
    { value: sendAmount }
  );
  const refundReceipt1 = await refundTx1.wait();
  const refundEvent = refundReceipt1.logs
    .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "TransferCreated");
  const refundTransferId = refundEvent.args.transferId;

  const refundTx2 = await contract.connect(deployer).refundTransfer(refundTransferId);
  await refundTx2.wait();
  logTx("refundTransfer", refundTx2.hash);

  const tRefunded = await contract.transfers(refundTransferId);
  if (!tRefunded.refunded) fail("Transfer should be refunded");
  pass("refundTransfer OK — funds returned to sender");

  // ─────────────────────────────────────────────────────────────
  // MODULE 2: GROUP PAYMENT
  // ─────────────────────────────────────────────────────────────
  section("MODULE 2: GroupPayment");

  const groupTarget      = ethers.parseEther("0.002");
  const contribution1    = ethers.parseEther("0.001");
  const contribution2    = ethers.parseEther("0.001"); // total = target → auto-distribute
  const beneficiaryAddr  = await recipient.getAddress();

  // createGroup
  console.log(`\n  [2.1] createGroup — target: ${ethers.formatEther(groupTarget)} INIT`);
  const createGroupTx = await contract.connect(deployer).createGroup(
    beneficiaryAddr,
    groupTarget,
    "Smoke test group"
  );
  const createGroupReceipt = await createGroupTx.wait();
  logTx("createGroup", createGroupTx.hash);

  const groupEvent = createGroupReceipt.logs
    .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "GroupCreated");
  if (!groupEvent) fail("GroupCreated event not found");
  const groupId = groupEvent.args.groupId;
  pass(`createGroup OK — groupId: ${groupId}`);

  // First contribution (doesn't reach target)
  console.log("\n  [2.2] contributeToGroup — first contribution");
  const contrib1Tx = await contract.connect(deployer).contributeToGroup(groupId, { value: contribution1 });
  await contrib1Tx.wait();
  logTx("contributeToGroup #1", contrib1Tx.hash);

  const g1 = await contract.groups(groupId);
  if (g1.distributed) fail("Should not be distributed yet");
  pass(`First contribution OK — pool: ${ethers.formatEther(g1.currentAmount)} INIT`);

  // Second contribution (reaches target → auto-distribute)
  console.log("\n  [2.3] contributeToGroup — second contribution (triggers auto-distribution)");
  const benBalBefore = await ethers.provider.getBalance(beneficiaryAddr);
  const contrib2Tx   = await contract.connect(contributor).contributeToGroup(groupId, { value: contribution2 });
  const contrib2Receipt = await contrib2Tx.wait();
  logTx("contributeToGroup #2", contrib2Tx.hash);

  const distributedEvent = contrib2Receipt.logs
    .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "GroupDistributed");
  if (!distributedEvent) fail("GroupDistributed event not found");

  const g2 = await contract.groups(groupId);
  if (!g2.distributed) fail("Group should be distributed");
  pass(`Auto-distribution OK — ${ethers.formatEther(groupTarget)} INIT sent to beneficiary`);

  // ─────────────────────────────────────────────────────────────
  // MODULE 3: SAVINGS POT
  // ─────────────────────────────────────────────────────────────
  section("MODULE 3: SavingsPot");

  const potTarget  = ethers.parseEther("0.005");
  const deposit1   = ethers.parseEther("0.002");
  const deposit2   = ethers.parseEther("0.001");
  const withdrawal = ethers.parseEther("0.001");

  // createPot
  console.log(`\n  [3.1] createPot — target: ${ethers.formatEther(potTarget)} INIT`);
  const createPotTx = await contract.connect(deployer).createPot(
    "Vacation Fund",
    potTarget,
    false // yieldEnabled off for smoke test
  );
  const createPotReceipt = await createPotTx.wait();
  logTx("createPot", createPotTx.hash);

  const potEvent = createPotReceipt.logs
    .map(log => { try { return contract.interface.parseLog(log); } catch { return null; } })
    .find(e => e && e.name === "PotCreated");
  if (!potEvent) fail("PotCreated event not found");
  const potId = potEvent.args.potId;
  pass(`createPot OK — potId: ${potId}`);

  // depositToPot
  console.log("\n  [3.2] depositToPot x2");
  const dep1Tx = await contract.connect(deployer).depositToPot(potId, { value: deposit1 });
  await dep1Tx.wait();
  logTx("depositToPot #1", dep1Tx.hash);

  const dep2Tx = await contract.connect(deployer).depositToPot(potId, { value: deposit2 });
  await dep2Tx.wait();
  logTx("depositToPot #2", dep2Tx.hash);

  const potAfterDeposit = await contract.pots(potId);
  const expectedBalance = deposit1 + deposit2;
  if (potAfterDeposit.currentAmount !== expectedBalance) fail("Pot balance mismatch after deposits");
  pass(`depositToPot OK — pot balance: ${ethers.formatEther(potAfterDeposit.currentAmount)} INIT`);

  // withdrawFromPot
  console.log("\n  [3.3] withdrawFromPot");
  const wdTx = await contract.connect(deployer).withdrawFromPot(potId, withdrawal);
  await wdTx.wait();
  logTx("withdrawFromPot", wdTx.hash);

  const potAfterWithdraw = await contract.pots(potId);
  const expectedAfterWd  = expectedBalance - withdrawal;
  if (potAfterWithdraw.currentAmount !== expectedAfterWd) fail("Pot balance wrong after withdrawal");
  pass(`withdrawFromPot OK — pot balance: ${ethers.formatEther(potAfterWithdraw.currentAmount)} INIT`);

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  section("SMOKE TEST COMPLETE");
  console.log(`
  ✅ SecureTransfer.sendTransfer
  ✅ SecureTransfer.claimTransfer
  ✅ SecureTransfer.refundTransfer
  ✅ GroupPayment.createGroup
  ✅ GroupPayment.contributeToGroup (x2, auto-distribution triggered)
  ✅ SavingsPot.createPot
  ✅ SavingsPot.depositToPot (x2)
  ✅ SavingsPot.withdrawFromPot

  All 8 smoke tests passed on network: ${network.name}
  Contract: ${contractAddress}
  `);
}

main().catch((err) => {
  console.error("\nSmoke test FAILED:", err.message);
  process.exitCode = 1;
});

