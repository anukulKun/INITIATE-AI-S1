import { FormInput } from "../forms/FormInput";
import { FormTextarea } from "../forms/FormTextarea";

export const AINodeConfig = ({ nodeData, updateNodeData, setNodes, selectedNode }:any) => (
  <>
    <FormInput
      label="Node Name"
      value={nodeData?.name || ""}
      onChange={(val:any) => {
        updateNodeData("name", val);
        setNodes((nds:any) =>
          nds.map((node:any) =>
            node.id === selectedNode.id
              ? { ...node, data: { ...node.data, label: val || "AI" } }
              : node
          )
        );
      }}
      placeholder="Enter node name..."
    />
    <FormTextarea
      label="Prompt"
      value={nodeData?.prompt || ""}
      onChange={(val:any) => updateNodeData("prompt", val)}
      placeholder="Enter your AI prompt..."
      rows={6}
    />
  </>
);
