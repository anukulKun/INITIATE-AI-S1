import { FormInput } from "../forms/FormInput";
import { FormSelect } from "../forms/FormSelect";

export const IfElseNodeConfig = ({ nodeData, updateNodeData }:any) => (
  <>
    <FormInput
      label="Condition"
      value={nodeData?.condition || ""}
      onChange={(val:any) => updateNodeData("condition", val)}
      placeholder="e.g., value > 100"
    />
    <FormSelect
      label="Operator"
      value={nodeData?.operator || ""}
      onChange={(val:any) => updateNodeData("operator", val)}
      options={[
        { value: "equals", label: "Equals (==)" },
        { value: "not-equals", label: "Not Equals (!=)" },
        { value: "greater", label: "Greater Than (>)" },
        { value: "less", label: "Less Than (<)" },
        { value: "contains", label: "Contains" },
      ]}
    />
    <FormInput
      label="Compare Value"
      value={nodeData?.compareValue || ""}
      onChange={(val:any) => updateNodeData("compareValue", val)}
      placeholder="Enter comparison value..."
    />
  </>
);
