import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes/nodeTypes';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import ConfigPanel from './components/ConfigPanel';
import ToastContainer from './components/Toast';
import { useFlowApi } from './hooks/useFlowApi';
import { useToasts } from './hooks/useToasts';
import { useFlowHandlers } from './hooks/useFlowHandlers';
import { useToolbarActions } from './hooks/useToolbarActions';

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: 'rgba(139, 92, 246, 0.5)', strokeWidth: 2 },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'rgba(139, 92, 246, 0.7)',
    width: 20,
    height: 20,
  },
};

function FlowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const flowApi = useFlowApi();
  const { toasts, addToast, removeToast } = useToasts();

  useEffect(() => {
    if (flowApi.ready && flowApi.flowId) {
      setNodes(flowApi.initialNodes);
      setEdges(flowApi.initialEdges);
    }
  }, [flowApi.ready, flowApi.flowId, flowApi.initialNodes, flowApi.initialEdges, setNodes, setEdges]);

  useEffect(() => {
    if (flowApi.ready && flowApi.error) {
      addToast('error', `API hatası: ${flowApi.error}`);
    }
  }, [flowApi.ready, flowApi.error, addToast]);

  const storageSave = useCallback(() => flowApi.save(nodes, edges), [flowApi, nodes, edges]);
  const storageClear = useCallback(() => flowApi.clear(), [flowApi]);

  const {
    onConnect,
    handleIsValidConnection,
    onDragOver,
    onDrop,
    onNodeClick,
    onPaneClick,
    handleNodeUpdate,
    handleNodeDelete,
  } = useFlowHandlers({
    nodes,
    edges,
    setNodes,
    setEdges,
    setSelectedNode,
    addToast,
    screenToFlowPosition,
  });

  const { handleSave, handleValidate, handleClear, handleFitView, handleExport } =
    useToolbarActions({
      nodes,
      edges,
      setNodes,
      setEdges,
      setSelectedNode,
      addToast,
      storageSave,
      storageClear,
      fitView,
    });

  return (
    <div className="app-container">
      <Toolbar
        onSave={handleSave}
        onValidate={handleValidate}
        onClear={handleClear}
        onFitView={handleFitView}
        onExport={handleExport}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />
      <div className="app-body">
        <Sidebar />
        <div className="flow-wrapper" ref={reactFlowWrapper}>
          {nodes.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">⚡</div>
              <h3>Senaryo Oluşturun</h3>
              <p>
                Sol panelden tetikleyici ve eylem düğümlerini sürükleyip bu alana bırakın.
              </p>
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={handleIsValidConnection}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
            proOptions={{ hideAttribution: true }}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => (node.type === 'trigger' ? '#f59e0b' : '#8b5cf6')}
              maskColor="rgba(10, 10, 20, 0.8)"
              style={{ backgroundColor: 'rgba(18, 18, 35, 0.85)' }}
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="rgba(255, 255, 255, 0.05)"
            />
          </ReactFlow>
        </div>
        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onDelete={handleNodeDelete}
            onUpdate={handleNodeUpdate}
          />
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}

export default App;
