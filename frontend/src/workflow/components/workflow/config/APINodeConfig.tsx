import { FormInput } from "../forms/FormInput";
import { FormSelect } from "../forms/FormSelect";
import { FormTextarea } from "../forms/FormTextarea";

export const APINodeConfig = ({ nodeData, updateNodeData }:any) => (
  <>
    <FormSelect
      label="Method"
      value={nodeData?.method || ""}
      onChange={(val:any) => updateNodeData("method", val)}
      options={[
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "DELETE", label: "DELETE" },
      ]}
    />
    <FormInput
      label="URL"
      value={nodeData?.url || ""}
      onChange={(val:any) => updateNodeData("url", val)}
      placeholder="https://api.example.com/endpoint"
    />
    <FormTextarea
      label="Headers (JSON)"
      value={nodeData?.headers || ""}
      onChange={(val:any) => updateNodeData("headers", val)}
      placeholder='{"Authorization": "Bearer token"}'
    />
    <FormTextarea
      label="Body (JSON)"
      value={nodeData?.body || ""}
      onChange={(val:any) => updateNodeData("body", val)}
      placeholder='{"key": "value"}'
    />
  </>
);
