const express = require("express");
const { z } = require("zod");
const db = require("../db");
const { makeId } = require("../utils/id");
const { compileWorkflow } = require("../services/workflowCompiler");
const { validateBody } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const compileSchema = z.object({
  name: z.string().min(2),
  graph: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
  }),
});

router.post("/compile", requireAuth, validateBody(compileSchema), (req, res, next) => {
  try {
    const now = new Date().toISOString();
    const { name, graph } = req.validatedBody;
    const { prompt, manifest } = compileWorkflow(graph);

    const workflow = {
      id: makeId("wf"),
      user_id: req.user.sub,
      name,
      graph_json: JSON.stringify(graph),
      prompt,
      manifest_json: JSON.stringify(manifest),
      created_at: now,
      updated_at: now,
    };

    db.prepare(
      "INSERT INTO workflows (id, user_id, name, graph_json, prompt, manifest_json, created_at, updated_at) VALUES (@id, @user_id, @name, @graph_json, @prompt, @manifest_json, @created_at, @updated_at)"
    ).run(workflow);

    db.prepare(
      "INSERT INTO agents (id, workflow_id, state_json, status, retry_count, last_error, created_at, updated_at) VALUES (@id, @workflow_id, @state_json, @status, @retry_count, @last_error, @created_at, @updated_at)"
    ).run({
      id: makeId("agt"),
      workflow_id: workflow.id,
      state_json: JSON.stringify({ stage: "compiled" }),
      status: "active",
      retry_count: 0,
      last_error: null,
      created_at: now,
      updated_at: now,
    });

    res.status(201).json({ workflowId: workflow.id, prompt, manifest });
  } catch (error) {
    next(error);
  }
});

router.get("/:workflowId", requireAuth, (req, res) => {
  const workflow = db
    .prepare("SELECT id, name, prompt, manifest_json, graph_json FROM workflows WHERE id = ? AND user_id = ?")
    .get(req.params.workflowId, req.user.sub);

  if (!workflow) return res.status(404).json({ error: "Workflow not found" });

  return res.json({
    id: workflow.id,
    name: workflow.name,
    prompt: workflow.prompt,
    manifest: JSON.parse(workflow.manifest_json),
    graph: JSON.parse(workflow.graph_json),
  });
});

module.exports = router;