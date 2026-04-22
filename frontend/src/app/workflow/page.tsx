"use client";

import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { Brain, GitBranch, Wallet, ShieldCheck, PiggyBank, RefreshCcw, Landmark, HandCoins, Send, Rocket } from "lucide-react";
import { NodePalette } from "@/components/workflow/NodePalette";
import { IfElseNode } from "@/components/workflow/IfElseNode";
import { api } from "@/lib/api";

const initialNodes: Node[] = [
  {
    id: "persona-1",
    type: "default",
    data: { label: "AI Persona", nodeType: "ai", config: { prompt: "You are a DeFi assistant" } },
    position: { x: 120, y: 120 },
    style: { background: "#8b5cf6", color: "white", borderRadius: "10px", border: "1px solid #a78bfa" },
  },
];

const initialEdges: Edge[] = [];

const nodeTypes = [
  { id: "ai", label: "AI Persona", icon: Brain, color: "#8b5cf6" },
  { id: "if-else", label: "If Else", icon: GitBranch, color: "#f59e0b" },
  { id: "send-payment", label: "SendPayment", icon: Send, color: "#22c55e" },
  { id: "claim-payment", label: "ClaimPayment", icon: ShieldCheck, color: "#00d9ff" },
  { id: "refund-payment", label: "RefundPayment", icon: RefreshCcw, color: "#ef4444" },
  { id: "create-group", label: "CreateGroup", icon: Landmark, color: "#3b82f6" },
  { id: "contribute-group", label: "ContributeGroup", icon: HandCoins, color: "#0ea5e9" },
  { id: "create-pot", label: "CreatePot", icon: PiggyBank, color: "#06b6d4" },
  { id: "deposit-pot", label: "DepositPot", icon: Wallet, color: "#14b8a6" },
  { id: "withdraw-pot", label: "WithdrawPot", icon: Rocket, color: "#f97316" },
  { id: "bridge-asset", label: "BridgeAsset", icon: Rocket, color: "#a855f7" },
  { id: "resolve-username", label: "ResolveUsername", icon: ShieldCheck, color: "#84cc16" },
  { id: "balance-check", label: "BalanceCheck", icon: Wallet, color: "#facc15" },
];

function styleFor(color: string) {
  return {
    background: color,
    color: "#fff",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    padding: "12px",
    minWidth: "150px",
  };
}

export default function WorkflowBuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [counter, setCounter] = useState(2);
  const [workflowName, setWorkflowName] = useState("Initia DeFi Agent");
  const [result, setResult] = useState<{ workflowId?: string; prompt?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const customNodeTypes = useMemo(() => ({ ifElse: IfElseNode }), []);

  function onConnect(params: Edge | any) {
    setEdges((eds) => addEdge(params, eds));
  }

  function addNode(typeId: string) {
    const matched = nodeTypes.find((n) => n.id === typeId);
    if (!matched) return;
    const id = `node-${counter}`;
    setCounter((v) => v + 1);
    setNodes((curr) => [
      ...curr,
      {
        id,
        type: typeId === "if-else" ? "ifElse" : "default",
        data: { label: matched.label, nodeType: typeId, config: {} },
        position: { x: 120 + Math.random() * 500, y: 120 + Math.random() * 300 },
        style: typeId === "if-else" ? undefined : styleFor(matched.color),
      },
    ]);
  }

  async function compile() {
    setLoading(true);
    try {
      const graph = { nodes, edges };
      const output = await api.compileWorkflow(workflowName, graph);
      setResult(output);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen">
      <NodePalette nodeTypes={nodeTypes} onAddNode={addNode} />

      <section className="flex-1 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="rounded-md border border-white/20 bg-black/30 px-3 py-2"
          />
          <div className="flex gap-2">
            <button onClick={compile} className="rounded-md bg-brand-neon px-4 py-2 font-semibold text-black" disabled={loading}>
              {loading ? "Compiling..." : "Compile Workflow"}
            </button>
            <a href="/dashboard" className="rounded-md border border-white/20 px-4 py-2">
              Open Dashboard
            </a>
          </div>
        </div>

        {result?.workflowId && (
          <div className="mb-4 rounded-md border border-brand-neon/50 bg-brand-neon/10 p-3 text-sm">
            Compiled successfully. Workflow ID: {result.workflowId}
          </div>
        )}

        <div className="h-[74vh] overflow-hidden rounded-xl border border-white/15">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={customNodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#39FF14" />
          </ReactFlow>
        </div>
      </section>
    </main>
  );
}
