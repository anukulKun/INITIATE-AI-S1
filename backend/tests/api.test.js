const test = require("node:test");
const assert = require("node:assert/strict");
const { compileWorkflow } = require("../src/services/workflowCompiler");
const { resolveInitUsername } = require("../src/services/usernameResolver");
const { scoreRisk } = require("../src/services/fraudService");

test("compileWorkflow returns prompt and manifest", () => {
  const output = compileWorkflow({ nodes: [{ id: "1", data: { nodeType: "ai", label: "AI" } }], edges: [] });
  assert.equal(typeof output.prompt, "string");
  assert.equal(output.manifest.nodeCount, 1);
});

test("resolveInitUsername resolves valid .init", async () => {
  const output = await resolveInitUsername("alice.init");
  assert.match(output.address, /^0x[a-f0-9]{40}$/i);
});

test("scoreRisk increases for large values", () => {
  const low = scoreRisk({ amountWei: "1000", recipient: "0xabc", remark: "ok" });
  const high = scoreRisk({ amountWei: "200000000000000000000", recipient: "0xabc0000", remark: "urgent" });
  assert.ok(high > low);
});