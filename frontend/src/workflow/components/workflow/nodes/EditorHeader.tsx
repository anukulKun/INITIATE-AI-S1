"use client";

import { useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Zap,
  Brain,
  GitBranch,
  XCircle,
  Activity,
  Cloud,
  Plus,
  Save,
  Play,
  ArrowLeft,
  Globe,
} from "lucide-react";

const EditorHeader = ({
  workflowName,
  setWorkflowName,
  onSave,
  onRun,
  canRun,
}) => (
  <header className="bg-[#0a0a0f]/80 backdrop-blur-md border-b border-gray-800/50 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <button
        onClick={() => window.history.back()}
        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#39FF14]" />
          Workflow Editor
        </h1>
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="text-sm text-gray-400 bg-transparent border-none outline-none focus:text-white transition-colors"
          placeholder="Enter workflow name..."
        />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onSave}
        className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-800 hover:border-[#39FF14]/50 rounded-lg transition-all duration-300 hover:bg-[#39FF14]/5 font-semibold flex items-center gap-2"
      >
        <Save className="w-4 h-4" />
        Save
      </button>
      <button
        onClick={onRun}
        disabled={!canRun}
        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-300 flex items-center gap-2 ${
          canRun
            ? "bg-[#39FF14] text-black hover:bg-[#2de00f] shadow-[0_0_20px_rgba(57,255,20,0.3)]"
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        <Play className="w-4 h-4" />
        Run
      </button>
    </div>
  </header>
);
