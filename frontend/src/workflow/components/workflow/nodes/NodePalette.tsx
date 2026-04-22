import { Plus } from "lucide-react";

export const NodePalette = ({ nodeTypes, onAddNode }:any) => (
  <aside className="w-64 bg-gradient-to-b from-black/60 via-black/50 to-black/60 border-r border-gray-800/50 backdrop-blur-md p-6 overflow-y-auto">
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
        Nodes
      </h3>
      <div className="h-[2px] bg-gradient-to-r from-[#39FF14]/50 via-[#39FF14]/20 to-transparent rounded-full"></div>
    </div>

    <div className="space-y-2">
      {nodeTypes.map((nodeType:any) => (
        <button
          key={nodeType.id}
          onClick={() => onAddNode(nodeType.id)}
          className="group w-full flex items-center gap-3 px-4 py-3 bg-black/30 hover:bg-black/50 border border-gray-800/50 hover:border-gray-700 rounded-xl transition-all duration-300 text-left"
        >
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{
              backgroundColor: `${nodeType.color}20`,
              border: `1px solid ${nodeType.color}40`,
            }}
          >
            <nodeType.icon
              className="w-5 h-5"
              style={{ color: nodeType.color }}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white group-hover:text-gray-100">
              {nodeType.label}
            </p>
            <p className="text-xs text-gray-500">Click to add</p>
          </div>
          <Plus className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
        </button>
      ))}
    </div>

    <div className="mt-8 p-4 bg-gradient-to-br from-[#39FF14]/5 to-[#00D9FF]/5 rounded-xl border border-gray-800/50">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        Tips
      </h4>
      <ul className="space-y-2 text-xs text-gray-500">
        <li>• Drag nodes to position</li>
        <li>• Connect nodes by dragging from edges</li>
        <li>• Click on nodes to configure</li>
      </ul>
    </div>
  </aside>
);
