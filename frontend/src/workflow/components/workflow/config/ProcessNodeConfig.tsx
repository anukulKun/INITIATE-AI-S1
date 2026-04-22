import { FormInput } from "../forms/FormInput";
import { FormSelect } from "../forms/FormSelect";
import { FormTextarea } from "../forms/FormTextarea";

export const ProcessNodeConfig = ({ nodeData, updateNodeData }:any) => (
  <>
    <FormInput
      label="Process Name"
      value={nodeData?.name || ""}
      onChange={(val:any) => updateNodeData("name", val)}
      placeholder="Enter process name..."
    />
    <FormTextarea
      label="Description"
      value={nodeData?.description || ""}
      onChange={(val:any) => updateNodeData("description", val)}
      placeholder="Describe what this process does..."
    />
    <FormSelect
      label="Action"
      value={nodeData?.action || ""}
      onChange={(val:any) => updateNodeData("action", val)}
      options={[
        { value: "transform", label: "Transform Data" },
        { value: "filter", label: "Filter Data" },
        { value: "aggregate", label: "Aggregate Data" },
        { value: "custom", label: "Custom Action" },
      ]}
    />
  </>
);
