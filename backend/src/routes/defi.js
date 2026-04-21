const express = require("express");
const { z } = require("zod");
const db = require("../db");
const { makeId } = require("../utils/id");
const { requireAuth } = require("../middleware/auth");
const { validateBody } = require("../middleware/validate");
const { resolveInitUsername } = require("../services/usernameResolver");
const { scoreRisk, blockIfHighRisk } = require("../services/fraudService");
const { encrypt } = require("../services/securityService");
const { sendTransfer, createGroup, contributeGroup, createPot, depositPot, withdrawPot } = require("../services/paymentService");

const router = express.Router();

const transferSchema = z.object({
  workflowId: z.string().optional(),
  recipient: z.string().min(3),
  amountWei: z.string().min(1),
  remark: z.string().max(240).optional(),
});

const groupCreateSchema = z.object({
  workflowId: z.string().optional(),
  beneficiary: z.string().min(3),
  participantCount: z.number().int().min(1),
  amountWei: z.string().min(1),
  description: z.string().optional(),
});

const groupContribSchema = z.object({
  workflowId: z.string().optional(),
  groupId: z.string().min(3),
  amountWei: z.string().min(1),
});

const potCreateSchema = z.object({
  workflowId: z.string().optional(),
  label: z.string().min(2),
  targetAmountWei: z.string().min(1),
  yieldEnabled: z.boolean().default(false),
});

const potDepositSchema = z.object({
  workflowId: z.string().optional(),
  potId: z.string().min(3),
  amountWei: z.string().min(1),
});

const potWithdrawSchema = z.object({
  workflowId: z.string().optional(),
  potId: z.string().min(3),
  amountWei: z.string().min(1).optional(),
});

function insertPayment({ userId, workflowId, type, recipient, amountWei, txHash, remark, riskScore, metadata }) {
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO payments (id, user_id, workflow_id, payment_type, status, recipient, amount_wei, tx_hash, encrypted_remark, risk_score, metadata_json, created_at, updated_at) VALUES (@id, @user_id, @workflow_id, @payment_type, @status, @recipient, @amount_wei, @tx_hash, @encrypted_remark, @risk_score, @metadata_json, @created_at, @updated_at)"
  ).run({
    id: makeId("pay"),
    user_id: userId,
    workflow_id: workflowId || null,
    payment_type: type,
    status: txHash ? "submitted" : "pending",
    recipient: recipient || null,
    amount_wei: amountWei,
    tx_hash: txHash || null,
    encrypted_remark: encrypt(remark || ""),
    risk_score: riskScore,
    metadata_json: JSON.stringify(metadata || {}),
    created_at: now,
    updated_at: now,
  });
}

router.post("/transfer", requireAuth, validateBody(transferSchema), async (req, res, next) => {
  try {
    const body = req.validatedBody;
    const recipientResolved = body.recipient.endsWith(".init")
      ? (await resolveInitUsername(body.recipient)).address
      : body.recipient;

    const risk = scoreRisk({ amountWei: body.amountWei, recipient: recipientResolved, remark: body.remark });
    blockIfHighRisk(risk);

    const tx = await sendTransfer({ recipient: recipientResolved, amountWei: body.amountWei, remark: body.remark });

    insertPayment({
      userId: req.user.sub,
      workflowId: body.workflowId,
      type: "transfer",
      recipient: recipientResolved,
      amountWei: body.amountWei,
      txHash: tx.txHash,
      remark: body.remark,
      riskScore: risk,
      metadata: { originalRecipient: body.recipient },
    });

    res.status(201).json({ success: true, txHash: tx.txHash, riskScore: risk, recipient: recipientResolved });
  } catch (error) {
    next(error);
  }
});

router.post("/group/create", requireAuth, validateBody(groupCreateSchema), async (req, res, next) => {
  try {
    const body = req.validatedBody;
    const beneficiary = body.beneficiary.endsWith(".init")
      ? (await resolveInitUsername(body.beneficiary)).address
      : body.beneficiary;

    const tx = await createGroup({
      beneficiary,
      participantCount: body.participantCount,
      amountWei: body.amountWei,
      description: body.description,
    });

    insertPayment({
      userId: req.user.sub,
      workflowId: body.workflowId,
      type: "group_create",
      recipient: beneficiary,
      amountWei: body.amountWei,
      txHash: tx.txHash,
      remark: body.description,
      riskScore: 0,
      metadata: { participantCount: body.participantCount },
    });

    res.status(201).json({ success: true, txHash: tx.txHash });
  } catch (error) {
    next(error);
  }
});

router.post("/group/contribute", requireAuth, validateBody(groupContribSchema), async (req, res, next) => {
  try {
    const body = req.validatedBody;
    const tx = await contributeGroup({ groupId: body.groupId, amountWei: body.amountWei });

    insertPayment({
      userId: req.user.sub,
      workflowId: body.workflowId,
      type: "group_contribute",
      recipient: body.groupId,
      amountWei: body.amountWei,
      txHash: tx.txHash,
      remark: "Group contribution",
      riskScore: 0,
      metadata: { groupId: body.groupId },
    });

    res.status(201).json({ success: true, txHash: tx.txHash });
  } catch (error) {
    next(error);
  }
});

router.post("/pot/create", requireAuth, validateBody(potCreateSchema), async (req, res, next) => {
  try {
    const body = req.validatedBody;
    const tx = await createPot({
      label: body.label,
      targetAmountWei: body.targetAmountWei,
      yieldEnabled: body.yieldEnabled,
    });

    insertPayment({
      userId: req.user.sub,
      workflowId: body.workflowId,
      type: "pot_create",
      recipient: body.label,
      amountWei: body.targetAmountWei,
      txHash: tx.txHash,
      remark: body.yieldEnabled ? "yield-enabled" : "yield-disabled",
      riskScore: 0,
      metadata: { yieldEnabled: body.yieldEnabled },
    });

    res.status(201).json({ success: true, txHash: tx.txHash });
  } catch (error) {
    next(error);
  }
});

router.post("/pot/deposit", requireAuth, validateBody(potDepositSchema), async (req, res, next) => {
  try {
    const body = req.validatedBody;
    const tx = await depositPot({ potId: body.potId, amountWei: body.amountWei });

    insertPayment({
      userId: req.user.sub,
      workflowId: body.workflowId,
      type: "pot_deposit",
      recipient: body.potId,
      amountWei: body.amountWei,
      txHash: tx.txHash,
      remark: "pot-deposit",
      riskScore: 0,
      metadata: { potId: body.potId },
    });

    res.status(201).json({ success: true, txHash: tx.txHash });
  } catch (error) {
    next(error);
  }
});

router.post("/pot/withdraw", requireAuth, validateBody(potWithdrawSchema), async (req, res, next) => {
  try {
    const body = req.validatedBody;
    const tx = await withdrawPot({ potId: body.potId, amountWei: body.amountWei });

    insertPayment({
      userId: req.user.sub,
      workflowId: body.workflowId,
      type: "pot_withdraw",
      recipient: body.potId,
      amountWei: body.amountWei || "0",
      txHash: tx.txHash,
      remark: "pot-withdraw",
      riskScore: 0,
      metadata: { potId: body.potId },
    });

    res.status(201).json({ success: true, txHash: tx.txHash });
  } catch (error) {
    next(error);
  }
});

router.get("/transfers/:address", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      "SELECT id, status, recipient, amount_wei, tx_hash, created_at FROM payments WHERE user_id = ? AND payment_type = 'transfer' ORDER BY created_at DESC"
    )
    .all(req.user.sub);
  res.json({ items: rows, count: rows.length });
});

router.get("/pots/:address", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      "SELECT id, payment_type, status, recipient, amount_wei, tx_hash, created_at FROM payments WHERE user_id = ? AND payment_type IN ('pot_create', 'pot_deposit', 'pot_withdraw') ORDER BY created_at DESC"
    )
    .all(req.user.sub);
  res.json({ items: rows, count: rows.length });
});

module.exports = router;