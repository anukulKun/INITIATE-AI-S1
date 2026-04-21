const ACTION_REGISTRY = [
  "sendTransfer",
  "claimTransfer",
  "refundTransfer",
  "createGroup",
  "contributeGroup",
  "createPot",
  "depositPot",
  "withdrawPot",
  "interwovenBridge",
  "balanceCheck",
  "resolveUsername",
];

function compileWorkflow(graph) {
  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];

  const sections = [];
  const root = nodes.find((n) => n.type === "ai" || n.data?.nodeType === "ai");
  sections.push("You are an autonomous DeFi workflow agent running on Initia.");

  if (root?.data?.prompt) {
    sections.push(`Persona: ${root.data.prompt}`);
  }

  sections.push("Workflow Nodes:");
  for (const node of nodes) {
    const label = node.data?.label || node.type || "node";
    const nodeType = node.data?.nodeType || node.type;
    const config = node.data?.config ? JSON.stringify(node.data.config) : "{}";
    sections.push(`- ${node.id} [${nodeType}] ${label} config=${config}`);
  }

  sections.push("Workflow Edges:");
  for (const edge of edges) {
    sections.push(`- ${edge.source} -> ${edge.target} (${edge.sourceHandle || "default"})`);
  }

  sections.push(
    "Action Protocol: If a DeFi action is needed, return JSON only with shape {\"action\":string,\"params\":object}."
  );
  sections.push(`Supported actions: ${ACTION_REGISTRY.join(", ")}`);

  const prompt = sections.join("\n");
  const manifest = {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    rootNodeId: root?.id || null,
    actionTypes: ACTION_REGISTRY,
    estimatedComplexity: nodes.length > 15 ? "high" : nodes.length > 7 ? "medium" : "low",
  };

  return { prompt, manifest };
}

module.exports = { compileWorkflow, ACTION_REGISTRY };