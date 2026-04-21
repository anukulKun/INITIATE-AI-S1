/**
 * INITIATEAIS1Core.test.js
 *
 * Full Hardhat/Mocha/Chai test suite.
 * Run: npx hardhat test
 */

const { ethers }        = require("hardhat");
const { expect }        = require("chai");
const { loadFixture }   = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { time }          = require("@nomicfoundation/hardhat-toolbox/network-helpers");

// ─── fixture ──────────────────────────────────────────────────────

async function deployFixture() {
  const [owner, alice, bob, carol] = await ethers.getSigners();

  const chainId = 31337n; // hardhat default
  const Factory = await ethers.getContractFactory("INITIATEAIS1Core");
  const contract = await Factory.deploy(chainId);
  await contract.waitForDeployment();

  return { contract, owner, alice, bob, carol, chainId };
}

// ─── tests ────────────────────────────────────────────────────────

describe("INITIATEAIS1Core", function () {

  // ── Chain guard ───────────────────────────────────────────────

  describe("Chain guard", function () {
    it("sets ALLOWED_CHAIN_ID from constructor", async function () {
      const { contract, chainId } = await loadFixture(deployFixture);
      expect(await contract.ALLOWED_CHAIN_ID()).to.equal(chainId);
    });

    it("sets owner to deployer", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });
  });

  // ── MODULE 1: SecureTransfer ──────────────────────────────────

  describe("SecureTransfer", function () {
    const AMOUNT = ethers.parseEther("1.0");
    const REMARK = "test transfer";

    async function sendFixture() {
      const base = await loadFixture(deployFixture);
      const { contract, owner, alice } = base;
      const tx = await contract.connect(owner).sendTransfer(alice.address, REMARK, { value: AMOUNT });
      const receipt = await tx.wait();
      const event = receipt.logs
        .map(l => { try { return contract.interface.parseLog(l); } catch { return null; } })
        .find(e => e?.name === "TransferCreated");
      return { ...base, transferId: event.args.transferId, tx };
    }

    it("creates a transfer and emits TransferCreated", async function () {
      const { contract, owner, alice, tx } = await sendFixture();
      await expect(tx)
        .to.emit(contract, "TransferCreated")
        .withArgs(0n, owner.address, alice.address, AMOUNT, REMARK);
    });

    it("stores correct transfer state", async function () {
      const { contract, owner, alice, transferId } = await sendFixture();
      const t = await contract.transfers(transferId);
      expect(t.sender).to.equal(owner.address);
      expect(t.recipient).to.equal(alice.address);
      expect(t.amount).to.equal(AMOUNT);
      expect(t.claimed).to.be.false;
      expect(t.refunded).to.be.false;
      expect(t.remark).to.equal(REMARK);
    });

    it("indexes sender and recipient transfers", async function () {
      const { contract, owner, alice, transferId } = await sendFixture();
      const senderIds    = await contract.getSenderTransfers(owner.address);
      const recipientIds = await contract.getRecipientTransfers(alice.address);
      expect(senderIds).to.include(transferId);
      expect(recipientIds).to.include(transferId);
    });

    it("reverts on zero amount", async function () {
      const { contract, alice } = await loadFixture(deployFixture);
      await expect(
        contract.sendTransfer(alice.address, "nope", { value: 0 })
      ).to.be.revertedWith("INITIATE_AI_S1: zero amount");
    });

    it("reverts on zero address recipient", async function () {
      const { contract } = await loadFixture(deployFixture);
      await expect(
        contract.sendTransfer(ethers.ZeroAddress, "nope", { value: AMOUNT })
      ).to.be.revertedWith("INITIATE_AI_S1: zero recipient");
    });

    describe("claimTransfer", function () {
      it("transfers funds to recipient and marks claimed", async function () {
        const { contract, alice, transferId } = await sendFixture();
        await expect(
          contract.connect(alice).claimTransfer(transferId)
        ).to.emit(contract, "TransferClaimed");
        const t = await contract.transfers(transferId);
        expect(t.claimed).to.be.true;
      });

      it("reverts if not recipient", async function () {
        const { contract, bob, transferId } = await sendFixture();
        await expect(
          contract.connect(bob).claimTransfer(transferId)
        ).to.be.revertedWith("INITIATE_AI_S1: not recipient");
      });

      it("reverts if already claimed", async function () {
        const { contract, alice, transferId } = await sendFixture();
        await contract.connect(alice).claimTransfer(transferId);
        await expect(
          contract.connect(alice).claimTransfer(transferId)
        ).to.be.revertedWith("INITIATE_AI_S1: already claimed");
      });

      it("reverts if transfer expired", async function () {
        const { contract, alice, transferId } = await sendFixture();
        await time.increase(8 * 24 * 60 * 60); // 8 days
        await expect(
          contract.connect(alice).claimTransfer(transferId)
        ).to.be.revertedWith("INITIATE_AI_S1: transfer expired");
      });
    });

    describe("refundTransfer", function () {
      it("returns funds to sender and marks refunded", async function () {
        const { contract, owner, transferId } = await sendFixture();
        await expect(
          contract.connect(owner).refundTransfer(transferId)
        ).to.emit(contract, "TransferRefunded");
        const t = await contract.transfers(transferId);
        expect(t.refunded).to.be.true;
      });

      it("reverts if not sender", async function () {
        const { contract, alice, transferId } = await sendFixture();
        await expect(
          contract.connect(alice).refundTransfer(transferId)
        ).to.be.revertedWith("INITIATE_AI_S1: not sender");
      });

      it("reverts if already claimed", async function () {
        const { contract, owner, alice, transferId } = await sendFixture();
        await contract.connect(alice).claimTransfer(transferId);
        await expect(
          contract.connect(owner).refundTransfer(transferId)
        ).to.be.revertedWith("INITIATE_AI_S1: already claimed");
      });
    });
  });

  // ── MODULE 2: GroupPayment ────────────────────────────────────

  describe("GroupPayment", function () {
    const TARGET = ethers.parseEther("2.0");

    async function groupFixture() {
      const base = await loadFixture(deployFixture);
      const { contract, owner, alice } = base;
      const tx = await contract.connect(owner).createGroup(alice.address, TARGET, "Party fund");
      const receipt = await tx.wait();
      const event = receipt.logs
        .map(l => { try { return contract.interface.parseLog(l); } catch { return null; } })
        .find(e => e?.name === "GroupCreated");
      return { ...base, groupId: event.args.groupId, tx };
    }

    it("creates group and emits GroupCreated", async function () {
      const { contract, owner, alice, tx } = await groupFixture();
      await expect(tx)
        .to.emit(contract, "GroupCreated")
        .withArgs(0n, owner.address, alice.address, TARGET, "Party fund");
    });

    it("stores correct group state", async function () {
      const { contract, owner, alice, groupId } = await groupFixture();
      const g = await contract.groups(groupId);
      expect(g.beneficiary).to.equal(alice.address);
      expect(g.targetAmount).to.equal(TARGET);
      expect(g.currentAmount).to.equal(0n);
      expect(g.distributed).to.be.false;
    });

    it("reverts on zero target", async function () {
      const { contract, alice } = await loadFixture(deployFixture);
      await expect(
        contract.createGroup(alice.address, 0, "desc")
      ).to.be.revertedWith("INITIATE_AI_S1: zero target");
    });

    it("accepts contributions and updates pool", async function () {
      const { contract, bob, groupId } = await groupFixture();
      const contrib = ethers.parseEther("1.0");
      await expect(
        contract.connect(bob).contributeToGroup(groupId, { value: contrib })
      ).to.emit(contract, "GroupContribution");
      const g = await contract.groups(groupId);
      expect(g.currentAmount).to.equal(contrib);
      expect(g.distributed).to.be.false;
    });

    it("auto-distributes when target is reached", async function () {
      const { contract, bob, carol, alice, groupId } = await groupFixture();
      const half = TARGET / 2n;

      await contract.connect(bob).contributeToGroup(groupId, { value: half });

      await expect(
        contract.connect(carol).contributeToGroup(groupId, { value: half })
      ).to.emit(contract, "GroupDistributed")
        .withArgs(groupId, alice.address, TARGET);

      const g = await contract.groups(groupId);
      expect(g.distributed).to.be.true;
    });

    it("reverts contribution after distribution", async function () {
      const { contract, bob, carol, groupId } = await groupFixture();
      const half = TARGET / 2n;
      await contract.connect(bob).contributeToGroup(groupId, { value: half });
      await contract.connect(carol).contributeToGroup(groupId, { value: half });

      await expect(
        contract.connect(bob).contributeToGroup(groupId, { value: half })
      ).to.be.revertedWith("INITIATE_AI_S1: already distributed");
    });
  });

  // ── MODULE 3: SavingsPot ──────────────────────────────────────

  describe("SavingsPot", function () {
    const TARGET  = ethers.parseEther("5.0");
    const DEPOSIT = ethers.parseEther("1.0");

    async function potFixture() {
      const base = await loadFixture(deployFixture);
      const { contract, owner } = base;
      const tx = await contract.connect(owner).createPot("Holiday", TARGET, false);
      const receipt = await tx.wait();
      const event = receipt.logs
        .map(l => { try { return contract.interface.parseLog(l); } catch { return null; } })
        .find(e => e?.name === "PotCreated");
      return { ...base, potId: event.args.potId, tx };
    }

    it("creates pot and emits PotCreated", async function () {
      const { contract, owner, tx } = await potFixture();
      await expect(tx)
        .to.emit(contract, "PotCreated")
        .withArgs(0n, owner.address, "Holiday", TARGET, false);
    });

    it("stores correct pot state", async function () {
      const { contract, owner, potId } = await potFixture();
      const pot = await contract.pots(potId);
      expect(pot.owner).to.equal(owner.address);
      expect(pot.label).to.equal("Holiday");
      expect(pot.targetAmount).to.equal(TARGET);
      expect(pot.currentAmount).to.equal(0n);
      expect(pot.closed).to.be.false;
    });

    it("deposits increase pot balance", async function () {
      const { contract, owner, potId } = await potFixture();
      await contract.connect(owner).depositToPot(potId, { value: DEPOSIT });
      const pot = await contract.pots(potId);
      expect(pot.currentAmount).to.equal(DEPOSIT);
    });

    it("emits PotGoalReached when target met", async function () {
      const { contract, owner, potId } = await potFixture();
      await expect(
        contract.connect(owner).depositToPot(potId, { value: TARGET })
      ).to.emit(contract, "PotGoalReached");
    });

    it("withdraws correct amount", async function () {
      const { contract, owner, potId } = await potFixture();
      await contract.connect(owner).depositToPot(potId, { value: DEPOSIT });
      const withdraw = ethers.parseEther("0.5");
      await expect(
        contract.connect(owner).withdrawFromPot(potId, withdraw)
      ).to.emit(contract, "PotWithdraw");
      const pot = await contract.pots(potId);
      expect(pot.currentAmount).to.equal(DEPOSIT - withdraw);
    });

    it("reverts withdrawal if insufficient balance", async function () {
      const { contract, owner, potId } = await potFixture();
      await contract.connect(owner).depositToPot(potId, { value: DEPOSIT });
      await expect(
        contract.connect(owner).withdrawFromPot(potId, DEPOSIT * 2n)
      ).to.be.revertedWith("INITIATE_AI_S1: insufficient balance");
    });

    it("reverts withdrawal by non-owner", async function () {
      const { contract, alice, potId } = await potFixture();
      await expect(
        contract.connect(alice).withdrawFromPot(potId, DEPOSIT)
      ).to.be.revertedWith("INITIATE_AI_S1: not pot owner");
    });

    it("closePot withdraws all remaining funds", async function () {
      const { contract, owner, potId } = await potFixture();
      await contract.connect(owner).depositToPot(potId, { value: DEPOSIT });
      await contract.connect(owner).closePot(potId);
      const pot = await contract.pots(potId);
      expect(pot.closed).to.be.true;
      expect(pot.currentAmount).to.equal(0n);
    });

    it("reverts deposit to closed pot", async function () {
      const { contract, owner, potId } = await potFixture();
      await contract.connect(owner).closePot(potId);
      await expect(
        contract.connect(owner).depositToPot(potId, { value: DEPOSIT })
      ).to.be.revertedWith("INITIATE_AI_S1: pot is closed");
    });
  });

  // ── Admin ─────────────────────────────────────────────────────

  describe("Admin", function () {
    it("owner can set yield router", async function () {
      const { contract, owner, alice } = await loadFixture(deployFixture);
      await expect(
        contract.connect(owner).setYieldRouter(alice.address)
      ).to.emit(contract, "YieldRouterUpdated");
      expect(await contract.yieldRouter()).to.equal(alice.address);
    });

    it("non-owner cannot set yield router", async function () {
      const { contract, alice } = await loadFixture(deployFixture);
      await expect(
        contract.connect(alice).setYieldRouter(alice.address)
      ).to.be.revertedWith("INITIATE_AI_S1: not owner");
    });

    it("owner can transfer ownership", async function () {
      const { contract, owner, alice } = await loadFixture(deployFixture);
      await contract.connect(owner).transferOwnership(alice.address);
      expect(await contract.owner()).to.equal(alice.address);
    });
  });
});

