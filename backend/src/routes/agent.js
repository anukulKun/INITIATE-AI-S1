const express = require("express");
const { z } = require("zod");
const { ethers } = require("ethers");
const db = require("../db");
const { runAgent } = require("../services/agentService");
const { sendTransfer, createGroup, contributeGroup, createPot, depositPot, withdrawPot } = require("../services/paymentService");
const { resolveInitUsername } = require("../services/usernameResolver");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { makeId } = require("../utils/id");

const router = express.Router();

const chatSchema = z.object({
  workflowId: z.string().min(3),
  message: z.string().min(1),
});

function getUserBalanceSummary(userId) {
  const totals = db
    .prepare(
      `SELECT
         COUNT(*) AS total_count,
         COALESCE(SUM(CAST(amount_wei AS REAL)), 0) AS total_amount_wei,
         COALESCE(SUM(CASE WHEN payment_type = 'transfer' THEN CAST(amount_wei AS REAL) ELSE 0 END), 0) AS transfer_amount_wei,
         COALESCE(SUM(CASE WHEN payment_type IN ('pot_create', 'pot_deposit') THEN CAST(amount_wei AS REAL) ELSE 0 END), 0) AS savings_amount_wei
       FROM payments
       WHERE user_id = ?`
    )
    .get(userId);

  const latest = db
    .prepare(
      "SELECT payment_type, amount_wei, status, created_at FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 5"
    )
    .all(userId);

  return {
    totalPayments: Number(totals?.total_count || 0),
    totalAmountWei: String(Math.trunc(Number(totals?.total_amount_wei || 0))),
    transferAmountWei: String(Math.trunc(Number(totals?.transfer_amount_wei || 0))),
    savingsAmountWei: String(Math.trunc(Number(totals?.savings_amount_wei || 0))),
    recentPayments: latest,
  };
}

function normalizeAmountWei(params, fallbackWei) {
  if (params.amountWei !== undefined && params.amountWei !== null) {
    return String(params.amountWei);
  }

  if (params.amount !== undefined && params.amount !== null) {
    try {
      return ethers.parseUnits(String(params.amount), 18).toString();
    } catch {
      return fallbackWei;
    }
  }

  return fallbackWei;
}

async function normalizeRecipient(recipient) {
  if (!recipient || typeof recipient !== "string") return recipient;
  if (!recipient.endsWith(".init")) return recipient;

  const resolved = await resolveInitUsername(recipient);
  return resolved.address;
}

async function executeAction(action, userId) {
  if (!action) return null;
  const params = action.params || {};

  switch (action.action) {
    case "sendTransfer": {
      const recipient = await normalizeRecipient(params.recipient || params.to);
      return sendTransfer({
        recipient,
        amountWei: normalizeAmountWei(params, "10000000000000000"),
        remark: params.remark || "agent-triggered transfer",
      });
    }
    case "createGroup": {
      const beneficiary = await normalizeRecipient(params.beneficiary);
      return createGroup({
        beneficiary,
        amountWei: normalizeAmountWei(params, "1000000000000000000"),
        description: params.description || "agent-created group",
      });
    }
    case "contributeGroup":
      return contributeGroup({
        groupId: params.groupId,
        amountWei: normalizeAmountWei(params, "10000000000000000"),
      });
    case "createPot":
      return createPot({
        label: params.label || "Auto Savings Pot",
        targetAmountWei: params.targetAmountWei || normalizeAmountWei(params, "1000000000000000000"),
        yieldEnabled: Boolean(params.yieldEnabled),
      });
    case "depositPot":
      return depositPot({
        potId: params.potId,
        amountWei: normalizeAmountWei(params, "10000000000000000"),
      });
    case "withdrawPot":
      return withdrawPot({
        potId: params.potId,
        amountWei: params.amountWei,
      });
    case "balanceCheck":
      return {
        status: "ok",
        source: "local-ledger",
        summary: getUserBalanceSummary(userId),
      };
    default:
      return { status: "ignored", reason: "unknown action" };
  }
}

router.post("/chat", requireAuth, validateBody(chatSchema), async (req, res, next) => {
  try {
    const workflow = db
      .prepare("SELECT id, prompt FROM workflows WHERE id = ? AND user_id = ?")
      .get(req.validatedBody.workflowId, req.user.sub);

    if (!workflow) return res.status(404).json({ error: "Workflow not found" });

    const result = await runAgent({ prompt: workflow.prompt, message: req.validatedBody.message });
    let actionResult = null;
    let actionError = null;

    if (result.action) {
      try {
        actionResult = await executeAction(result.action, req.user.sub);
      } catch (error) {
        actionResult = {
          status: "failed",
          reason: "action execution failed",
        };
        actionError = {
          message: error?.message || "unknown action error",
        };
      }
    }

    if (result.action && actionResult?.txHash) {
      const now = new Date().toISOString();
      const agentId = db.prepare("SELECT id FROM agents WHERE workflow_id = ? LIMIT 1").get(workflow.id)?.id;

      if (agentId) {
      db.prepare(
        "INSERT INTO tasks (id, agent_id, task_type, payload_json, status, attempt, error_message, created_at, updated_at) VALUES (@id, @agent_id, @task_type, @payload_json, @status, @attempt, @error_message, @created_at, @updated_at)"
      ).run({
        id: makeId("tsk"),
        agent_id: agentId,
        task_type: result.action.action,
        payload_json: JSON.stringify(result.action.params || {}),
        status: "done",
        attempt: 1,
        error_message: null,
        created_at: now,
        updated_at: now,
      });
      }

      if (result.action.action === "sendTransfer") {
        const params = result.action.params || {};
        const recipientRaw = params.recipient || params.to;
        const recipient = await normalizeRecipient(recipientRaw);
        const amountWei = normalizeAmountWei(params, "10000000000000000");

        db.prepare(
          "INSERT INTO payments (id, user_id, workflow_id, payment_type, status, recipient, amount_wei, tx_hash, encrypted_remark, risk_score, metadata_json, created_at, updated_at) VALUES (@id, @user_id, @workflow_id, @payment_type, @status, @recipient, @amount_wei, @tx_hash, @encrypted_remark, @risk_score, @metadata_json, @created_at, @updated_at)"
        ).run({
          id: makeId("pay"),
          user_id: req.user.sub,
          workflow_id: workflow.id,
          payment_type: "transfer",
          status: "submitted",
          recipient: recipient || null,
          amount_wei: amountWei,
          tx_hash: actionResult.txHash,
          encrypted_remark: null,
          risk_score: 0,
          metadata_json: JSON.stringify({ source: "agent-chat", originalRecipient: recipientRaw || null }),
          created_at: now,
          updated_at: now,
        });
      }
    }

    res.json({
      success: true,
      response: result.response,
      action: result.action,
      actionResult,
      actionError,
      model: result.model,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;