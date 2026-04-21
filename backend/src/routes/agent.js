const express = require("express");
const { z } = require("zod");
const db = require("../db");
const { runAgent } = require("../services/agentService");
const { sendTransfer, createGroup, contributeGroup, createPot, depositPot, withdrawPot } = require("../services/paymentService");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { makeId } = require("../utils/id");

const router = express.Router();

const chatSchema = z.object({
  workflowId: z.string().min(3),
  message: z.string().min(1),
});

async function executeAction(action) {
  if (!action) return null;
  switch (action.action) {
    case "sendTransfer":
      return sendTransfer(action.params);
    case "createGroup":
      return createGroup(action.params);
    case "contributeGroup":
      return contributeGroup(action.params);
    case "createPot":
      return createPot(action.params);
    case "depositPot":
      return depositPot(action.params);
    case "withdrawPot":
      return withdrawPot(action.params);
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
    const actionResult = await executeAction(result.action);

    if (result.action && actionResult?.txHash) {
      const now = new Date().toISOString();
      db.prepare(
        "INSERT INTO tasks (id, agent_id, task_type, payload_json, status, attempt, error_message, created_at, updated_at) VALUES (@id, @agent_id, @task_type, @payload_json, @status, @attempt, @error_message, @created_at, @updated_at)"
      ).run({
        id: makeId("tsk"),
        agent_id: db.prepare("SELECT id FROM agents WHERE workflow_id = ? LIMIT 1").get(workflow.id)?.id,
        task_type: result.action.action,
        payload_json: JSON.stringify(result.action.params || {}),
        status: "done",
        attempt: 1,
        error_message: null,
        created_at: now,
        updated_at: now,
      });
    }

    res.json({
      success: true,
      response: result.response,
      action: result.action,
      actionResult,
      model: result.model,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;