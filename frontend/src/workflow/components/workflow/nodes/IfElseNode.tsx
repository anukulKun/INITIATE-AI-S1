"use client"

import { useState, useCallback } from 'react'
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
} from 'reactflow'
import 'reactflow/dist/style.css'
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
  Globe
} from 'lucide-react'

// ============= NODES =============
export const IfElseNode = ({ data }:any) => {
  return (
    <div style={{
      background: '#f59e0b',
      color: '#fff',
      border: '2px solid rgba(255,255,255,0.2)',
      borderRadius: '12px',
      padding: '12px 24px',
      fontWeight: 'bold',
      fontSize: '14px',
      minWidth: '120px',
      textAlign: 'center'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#39FF14' }} />
      {data.label}
      <Handle 
        type="source" 
        position={Position.Left} 
        id="false"
        style={{ background: '#ef4444', left: '10px', top: '50%' }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="true"
        style={{ background: '#10b981', right: '10px', top: '50%' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="default"
        style={{ background: '#6b7280' }}
      />
    </div>
  )
}

// ============= HEADER COMPONENT =============