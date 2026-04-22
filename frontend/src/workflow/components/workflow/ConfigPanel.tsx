import { XCircle } from "lucide-react";
import { AINodeConfig } from "./config/AINodeConfig";
import { APINodeConfig } from "./config/APINodeConfig";
import { IfElseNodeConfig } from "./config/IfElseNodeConfig";
import { ProcessNodeConfig } from "./config/ProcessNodeConfig";
import { WebCrawlerNodeConfig } from "./config/WebCrawlerNodeConfig";

export const ConfigPanel = ({
  selectedNode,
  nodeData,
  updateNodeData,
  setNodes,
  setEdges,
  onClose,
}:any) => {
  if (!selectedNode) return null;

  const renderConfig = () => {
    const data = nodeData[selectedNode.id];

    switch (selectedNode.data.nodeType) {
      case "ai":
        return (
          <AINodeConfig
            nodeData={data}
            updateNodeData={updateNodeData}
            setNodes={setNodes}
            selectedNode={selectedNode}
          />
        );
      case "process":
        return (
          <ProcessNodeConfig nodeData={data} updateNodeData={updateNodeData} />
        );
      case "if-else":
        return (
          <IfElseNodeConfig nodeData={data} updateNodeData={updateNodeData} />
        );
      case "api":
        return (
          <APINodeConfig nodeData={data} updateNodeData={updateNodeData} />
        );
      case "web-crawler":
        return (
          <WebCrawlerNodeConfig
            nodeData={data}
            updateNodeData={updateNodeData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-96 bg-gradient-to-b from-black/60 via-black/50 to-black/60 border-l border-gray-800/50 backdrop-blur-md overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-[#39FF14] rounded-full"></span>
            Configure Node
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-black/30 rounded-xl border border-gray-800/50">
            <p className="text-xs text-gray-500 mb-1">Node Type</p>
            <p className="text-sm font-semibold text-white capitalize">
              {selectedNode.data.nodeType || "Unknown"}
            </p>
          </div>

          {renderConfig()}

          <button
            className="w-full px-4 py-3 bg-[#39FF14] text-black font-bold rounded-xl hover:bg-[#2de00f] transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
            onClick={onClose}
          >
            Save Configuration
          </button>

          {selectedNode.id !== "1" && (
            <button
              className="w-full px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2"
              onClick={() => {
                setNodes((nds:any) =>
                  nds.filter((node:any) => node.id !== selectedNode.id)
                );
                setEdges((eds:any) =>
                  eds.filter(
                    (edge:any) =>
                      edge.source !== selectedNode.id &&
                      edge.target !== selectedNode.id
                  )
                );
                onClose();
              }}
            >
              <XCircle className="w-4 h-4" />
              Delete Node
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
