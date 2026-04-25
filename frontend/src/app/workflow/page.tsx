"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
  type Connection,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import Link from "next/link";
import {
  Brain,
  GitBranch,
  Wallet,
  ShieldCheck,
  PiggyBank,
  RefreshCcw,
  Landmark,
  HandCoins,
  Send,
  Rocket,
  Network,
  ArrowRight,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { NodePalette } from "@/components/workflow/NodePalette";
import { IfElseNode } from "@/components/workflow/IfElseNode";
import { api } from "@/lib/api";

/* ─────────────────────────────────────────
   Node type registry
───────────────────────────────────────── */
const nodeTypes = [
  { id: "ai",               label: "AI Persona",       icon: Brain,        color: "#8b5cf6" },
  { id: "if-else",          label: "If Else",           icon: GitBranch,    color: "#f59e0b" },
  { id: "send-payment",     label: "SendPayment",       icon: Send,         color: "#22c55e" },
  { id: "claim-payment",    label: "ClaimPayment",      icon: ShieldCheck,  color: "#00d9ff" },
  { id: "refund-payment",   label: "RefundPayment",     icon: RefreshCcw,   color: "#ef4444" },
  { id: "create-group",     label: "CreateGroup",       icon: Landmark,     color: "#3b82f6" },
  { id: "contribute-group", label: "ContributeGroup",   icon: HandCoins,    color: "#0ea5e9" },
  { id: "create-pot",       label: "CreatePot",         icon: PiggyBank,    color: "#06b6d4" },
  { id: "deposit-pot",      label: "DepositPot",        icon: Wallet,       color: "#14b8a6" },
  { id: "withdraw-pot",     label: "WithdrawPot",       icon: Rocket,       color: "#f97316" },
  { id: "bridge-asset",     label: "BridgeAsset",       icon: Rocket,       color: "#a855f7" },
  { id: "resolve-username", label: "ResolveUsername",   icon: ShieldCheck,  color: "#84cc16" },
  { id: "balance-check",    label: "BalanceCheck",      icon: Wallet,       color: "#facc15" },
];

function nodeStyle(color: string) {
  return {
    background: color,
    color: "#fff",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.18)",
    padding: "12px 16px",
    minWidth: "160px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "'Inter Tight', sans-serif",
    boxShadow: `0 4px 24px ${color}44`,
  };
}

const CENTER_X = 400;
const CENTER_Y = 260;

const initialNodes: Node[] = [
  {
    id: "persona-1",
    type: "default",
    data: { label: "AI Persona", nodeType: "ai", config: { prompt: "You are a DeFi assistant" } },
    position: { x: CENTER_X, y: CENTER_Y },
    style: nodeStyle("#8b5cf6"),
  },
];
const initialEdges: Edge[] = [];

/* ─────────────────────────────────────────
   Main Component
───────────────────────────────────────── */
export default function WorkflowBuilderPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [counter, setCounter] = useState(2);
  const [workflowName, setWorkflowName] = useState("Initia DeFi Agent");
  const [result, setResult] = useState<{ workflowId?: string; prompt?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const customNodeTypes = useMemo(() => ({ ifElse: IfElseNode }), []);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  function addNode(typeId: string) {
    const matched = nodeTypes.find((n) => n.id === typeId);
    if (!matched) return;
    const id = `node-${counter}`;
    setCounter((v) => v + 1);

    // Spread nodes in a readable spiral around center
    const angle = (counter * 137.5 * Math.PI) / 180;
    const radius = 80 + counter * 30;
    const x = CENTER_X + Math.cos(angle) * radius;
    const y = CENTER_Y + Math.sin(angle) * radius;

    setNodes((curr) => [
      ...curr,
      {
        id,
        type: typeId === "if-else" ? "ifElse" : "default",
        data: { label: matched.label, nodeType: typeId, config: {} },
        position: { x, y },
        style: typeId === "if-else" ? undefined : nodeStyle(matched.color),
      },
    ]);
  }

  function clearCanvas() {
    setNodes(initialNodes);
    setEdges([]);
    setCounter(2);
    setResult(null);
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:          #0a0a0a;
          --bg-2:        #111111;
          --bg-3:        #1a1a1a;
          --border:      rgba(255,255,255,0.08);
          --border-2:    rgba(255,255,255,0.13);
          --text:        rgb(237,237,237);
          --text-muted:  rgb(160,160,160);
          --text-dim:    rgb(100,100,100);
          --accent:         #adff2f;
          --accent-fg:      #000000;
          --accent-dim:     rgba(173,255,47,0.12);
          --accent-border:  rgba(173,255,47,0.2);
          --font-sans:  'Geist', ui-sans-serif, system-ui, sans-serif;
          --font-tight: 'Inter Tight', ui-sans-serif, sans-serif;
          --font-mono:  'JetBrains Mono', monospace;
        }

        [data-theme="light"] {
          --bg:          #fafaf8;
          --bg-2:        #f2f1ee;
          --bg-3:        #e8e7e3;
          --border:      rgba(0,0,0,0.08);
          --border-2:    rgba(0,0,0,0.15);
          --text:        rgb(18,18,18);
          --text-muted:  rgb(70,70,70);
          --text-dim:    rgb(140,140,140);
          --accent:         #1a6b00;
          --accent-fg:      #ffffff;
          --accent-dim:     rgba(26,107,0,0.09);
          --accent-border:  rgba(26,107,0,0.22);
        }

        html, body {
          font-family: var(--font-sans);
          background: var(--bg); color: var(--text);
          font-size: 16px; line-height: normal; font-weight: 400;
          -webkit-font-smoothing: antialiased;
          transition: background 0.25s, color 0.25s;
          overflow: hidden;
        }

        /* ── Nav ── */
        .wf-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 52px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px; background: var(--bg);
          border-bottom: 1px solid var(--border);
        }
        .nav-left  { display: flex; align-items: center; gap: 10px; }
        .nav-right { display: flex; align-items: center; gap: 8px; }
        .nav-logo {
          width: 28px; height: 28px; background: var(--accent);
          border-radius: 6px; display: grid; place-items: center;
          color: var(--accent-fg); flex-shrink: 0;
        }
        .nav-wordmark {
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text); letter-spacing: 0.02em;
        }
        .nav-divider { width: 1px; height: 18px; background: var(--border-2); margin: 0 4px; }
        .nav-sub {
          font-family: var(--font-mono); font-size: 10px;
          color: var(--text-dim); letter-spacing: 0.04em;
        }
        .nav-crumb {
          display: flex; align-items: center; gap: 4px;
          font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
        }
        .nav-crumb span { color: var(--text-muted); }

        /* Buttons */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 13px; font-family: var(--font-tight); font-size: 12px; font-weight: 600;
          color: var(--accent-fg); background: var(--accent);
          border: none; border-radius: 5px; cursor: pointer;
          transition: opacity 0.15s, transform 0.15s; text-decoration: none; letter-spacing: 0.01em;
        }
        .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 13px; font-family: var(--font-tight); font-size: 12px; font-weight: 600;
          color: var(--text-muted); background: transparent;
          border: 1px solid var(--border-2); border-radius: 5px; cursor: pointer;
          transition: all 0.15s; text-decoration: none;
        }
        .btn-ghost:hover { color: var(--text); background: var(--bg-2); }

        .btn-danger {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 13px; font-family: var(--font-tight); font-size: 12px; font-weight: 600;
          color: #ef4444; background: transparent;
          border: 1px solid rgba(239,68,68,0.3); border-radius: 5px; cursor: pointer;
          transition: all 0.15s;
        }
        .btn-danger:hover { background: rgba(239,68,68,0.08); }

        .theme-btn {
          display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px;
          background: var(--bg-2); border: 1px solid var(--border-2); border-radius: 5px;
          cursor: pointer; font-family: var(--font-mono); font-size: 10px;
          color: var(--text-dim); transition: color 0.15s; user-select: none; outline: none;
        }
        .theme-btn:hover { color: var(--text-muted); }
        .theme-btn .ti {
          width: 12px; height: 12px; border-radius: 50%;
          border: 1.5px solid var(--text-dim); transition: background 0.2s; flex-shrink: 0;
        }
        .theme-btn .ti.filled { background: var(--text-dim); }

        /* ── Layout ── */
        .wf-layout {
          display: flex; height: 100vh; padding-top: 52px;
        }

        /* ── Sidebar ── */
        .wf-sidebar {
          width: 220px; flex-shrink: 0;
          background: var(--bg); border-right: 1px solid var(--border);
          display: flex; flex-direction: column;
          transition: width 0.2s, opacity 0.2s;
          overflow: hidden;
        }
        .wf-sidebar.closed { width: 0; opacity: 0; }

        .sidebar-header {
          padding: 14px 16px 10px;
          border-bottom: 1px solid var(--border);
          font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
          letter-spacing: 0.09em; text-transform: uppercase;
        }

        .sidebar-nodes { flex: 1; overflow-y: auto; padding: 10px 8px; display: flex; flex-direction: column; gap: 2px; }
        .sidebar-nodes::-webkit-scrollbar { width: 3px; }
        .sidebar-nodes::-webkit-scrollbar-track { background: transparent; }
        .sidebar-nodes::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 2px; }

        .node-item {
          display: flex; align-items: center; gap: 9px;
          padding: 8px 10px; border-radius: 6px; cursor: pointer;
          transition: background 0.15s; border: 1px solid transparent;
        }
        .node-item:hover { background: var(--bg-2); border-color: var(--border); }
        .node-item:active { transform: scale(0.98); }

        .node-icon {
          width: 26px; height: 26px; border-radius: 6px;
          display: grid; place-items: center; flex-shrink: 0;
        }
        .node-label {
          font-family: var(--font-tight); font-size: 12px; font-weight: 500;
          color: var(--text-muted); flex: 1; white-space: nowrap;
        }
        .node-add {
          font-size: 16px; color: var(--text-dim); line-height: 1;
          opacity: 0; transition: opacity 0.15s;
        }
        .node-item:hover .node-add { opacity: 1; color: var(--accent); }

        /* ── Canvas area ── */
        .wf-canvas-wrap {
          flex: 1; display: flex; flex-direction: column; overflow: hidden;
        }

        /* toolbar below nav */
        .wf-toolbar {
          height: 48px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px; background: var(--bg-2);
          border-bottom: 1px solid var(--border); gap: 10px;
        }
        .toolbar-left  { display: flex; align-items: center; gap: 8px; }
        .toolbar-right { display: flex; align-items: center; gap: 6px; }

        .wf-name-input {
          padding: 5px 10px; background: var(--bg);
          border: 1px solid var(--border); border-radius: 5px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 500;
          color: var(--text); outline: none; min-width: 180px;
          transition: border-color 0.15s;
        }
        .wf-name-input:focus { border-color: var(--border-2); }

        .wf-canvas {
          flex: 1; position: relative;
        }

        /* ── Success toast ── */
        .wf-toast {
          position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
          z-index: 50; display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; background: var(--bg-2);
          border: 1px solid var(--accent-border); border-radius: 6px;
          font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          animation: slideUp 0.25s ease;
        }
        .toast-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
        @keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

        /* ── React Flow overrides ── */
        .react-flow__background { opacity: 0.4 !important; }
        .react-flow__controls { bottom: 16px !important; left: 16px !important; }
        .react-flow__controls button {
          background: var(--bg-2) !important; border: 1px solid var(--border) !important;
          color: var(--text-muted) !important;
        }
        .react-flow__controls button:hover { background: var(--bg-3) !important; }
        .react-flow__minimap {
          background: var(--bg-2) !important; border: 1px solid var(--border) !important;
          border-radius: 6px !important; bottom: 16px !important; right: 16px !important;
        }
        .react-flow__edge-path { stroke: var(--accent) !important; stroke-opacity: 0.6 !important; }
        .react-flow__edge.selected .react-flow__edge-path { stroke-opacity: 1 !important; }
        .react-flow__handle {
          background: var(--accent) !important;
          width: 8px !important; height: 8px !important;
          border: 2px solid var(--bg) !important;
        }
        .react-flow__attribution { display: none !important; }

        /* Light mode canvas bg */
        [data-theme="light"] .wf-canvas { background: #f4f3f0; }
        [data-theme="light"] .react-flow__background { opacity: 0.6 !important; }

        .sidebar-toggle {
          width: 28px; height: 28px; border-radius: 5px; display: grid; place-items: center;
          background: transparent; border: 1px solid var(--border); cursor: pointer;
          color: var(--text-dim); transition: all 0.15s;
        }
        .sidebar-toggle:hover { background: var(--bg-2); color: var(--text-muted); }

        /* Node count badge */
        .node-count {
          font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
          padding: 3px 8px; background: var(--bg-3); border: 1px solid var(--border);
          border-radius: 20px;
        }
        .node-count span { color: var(--accent); }
      `}</style>

      {/* ── Nav ── */}
      <nav className="wf-nav">
        <div className="nav-left">
          <Link href="/" className="nav-logo" style={{ textDecoration: "none" }}>
            <Network size={15} />
          </Link>
          <span className="nav-wordmark">INITIATE AI S1</span>
          <div className="nav-divider" />
          <div className="nav-crumb">
            <span style={{ color: "var(--text-dim)" }}>Workflow</span>
            <ChevronRight size={10} />
            <span>Canvas</span>
          </div>
        </div>
        <div className="nav-right">
          <span className="node-count">
            <span>{nodes.length}</span> nodes · <span>{edges.length}</span> edges
          </span>
          <button className="theme-btn" onClick={toggle} aria-label="Toggle theme">
            <div className={`ti${theme === "light" ? " filled" : ""}`} />
            {theme === "dark" ? "light" : "dark"}
          </button>
          <Link href="/auth" className="btn-ghost">Sign In</Link>
          <Link href="/dashboard" className="btn-ghost">Dashboard</Link>
        </div>
      </nav>

      {/* ── Layout ── */}
      <div className="wf-layout">

        {/* ── Sidebar ── */}
        <aside className={`wf-sidebar${sidebarOpen ? "" : " closed"}`}>
          <div className="sidebar-header">Nodes</div>
          <div className="sidebar-nodes">
            {nodeTypes.map(({ id, label, icon: Icon, color }) => (
              <div key={id} className="node-item" onClick={() => addNode(id)} role="button" tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && addNode(id)}>
                <div className="node-icon" style={{ background: color + "22" }}>
                  <Icon size={13} color={color} />
                </div>
                <span className="node-label">{label}</span>
                <span className="node-add">+</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Canvas area ── */}
        <div className="wf-canvas-wrap">

          {/* toolbar */}
          <div className="wf-toolbar">
            <div className="toolbar-left">
              <button className="sidebar-toggle" onClick={() => setSidebarOpen((v) => !v)} title="Toggle sidebar">
                <GitBranch size={12} />
              </button>
              <input
                className="wf-name-input"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="Workflow name…"
                spellCheck={false}
              />
            </div>
            <div className="toolbar-right">
              <button className="btn-danger" onClick={clearCanvas} title="Clear canvas">
                <Trash2 size={12} />
                Clear
              </button>
              <button className="btn-primary" onClick={compile} disabled={loading}>
                {loading ? (
                  <>Compiling…</>
                ) : (
                  <>
                    Compile Workflow <ArrowRight size={12} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* canvas */}
          <div className="wf-canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={customNodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.2}
              maxZoom={2}
              deleteKeyCode="Backspace"
            >
              <Controls showInteractive={false} />
              <MiniMap
                nodeColor={(n) => {
                  const t = nodeTypes.find((nt) => nt.id === n.data?.nodeType);
                  return t?.color ?? "#8b5cf6";
                }}
                maskColor="rgba(0,0,0,0.5)"
              />
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color={theme === "dark" ? "#adff2f" : "#1a6b00"}
              />

              {/* Empty state hint */}
              {nodes.length <= 1 && (
                <Panel position="top-center">
                  <div style={{
                    marginTop: 80,
                    padding: "10px 18px",
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--text-dim)",
                    letterSpacing: "0.04em",
                    pointerEvents: "none",
                  }}>
                    ← Click nodes from the sidebar to build your agent
                  </div>
                </Panel>
              )}
            </ReactFlow>

            {/* Success toast */}
            {result?.workflowId && (
              <div className="wf-toast">
                <div className="toast-dot" />
                Compiled · Workflow ID: <strong style={{ color: "var(--text)", marginLeft: 4 }}>{result.workflowId}</strong>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}