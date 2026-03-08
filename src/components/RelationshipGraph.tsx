import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../services/api';

interface RelationshipData {
  nodes: Node[];
  edges: Edge[];
}

function RelationshipGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/trace/relationships');
      const { nodes: newNodes, edges: newEdges } = response.data;
      
      setNodes(newNodes);
      setEdges(newEdges);
      setLoading(false);
    } catch (error) {
      console.error('[RelationshipGraph] 加载失败:', error);
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30 秒刷新
    return () => clearInterval(interval);
  }, [loadData]);

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  const handleCloseDetail = () => {
    setSelectedNode(null);
  };

  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-center text-gray-400">
          <span className="animate-spin text-4xl">🔄</span>
          <p className="mt-2">正在加载调用关系图...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-right"
          className="bg-gray-900"
        >
          <Background color="#374151" gap={20} />
          <Controls className="bg-gray-700 border-gray-600" />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as any;
              return data?.color || '#3B82F6';
            }}
            maskColor="rgba(17, 24, 39, 0.8)"
            className="bg-gray-800 border-gray-700"
          />
        </ReactFlow>
      </div>

      {/* 节点详情弹窗 */}
      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseDetail}
        >
          <div
            className="bg-gray-800 rounded-lg border border-gray-700 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">
                {(selectedNode.data as any)?.icon} {(selectedNode.data as any)?.label}
              </h3>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">类型</div>
                  <div className="text-white font-semibold">
                    {(selectedNode.data as any)?.typeName || (selectedNode.data as any)?.type}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">会话数量</div>
                  <div className="text-white font-mono text-lg">
                    {(selectedNode.data as any)?.count || 0}
                  </div>
                </div>
              </div>

              {(selectedNode.data as any)?.color && (
                <div>
                  <div className="text-gray-400 text-sm mb-2">状态颜色</div>
                  <div
                    className="h-8 rounded flex items-center justify-center text-white font-semibold"
                    style={{ background: (selectedNode.data as any)?.color }}
                  >
                    {(selectedNode.data as any)?.color}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700">
              <button
                onClick={handleCloseDetail}
                className="w-full px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RelationshipGraph;
