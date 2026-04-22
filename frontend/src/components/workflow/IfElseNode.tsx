import { Handle, Position } from "reactflow";

export function IfElseNode({ data }: { data: { label: string } }) {
  return (
    <div
      style={{
        background: "#f59e0b",
        color: "#fff",
        border: "2px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        padding: "12px 24px",
        fontWeight: "bold",
        fontSize: "14px",
        minWidth: "120px",
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: "#39FF14" }} />
      {data.label}
      <Handle type="source" position={Position.Left} id="false" style={{ background: "#ef4444", left: "10px", top: "50%" }} />
      <Handle type="source" position={Position.Right} id="true" style={{ background: "#10b981", right: "10px", top: "50%" }} />
      <Handle type="source" position={Position.Bottom} id="default" style={{ background: "#6b7280" }} />
    </div>
  );
}
