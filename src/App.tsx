import { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes/nodeTypes';
import { isValidConnection, validateDAG } from './utils/dagUtils';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import ConfigPanel from './components/ConfigPanel';
import ToastContainer, { createToast, type ToastMessage } from './components/Toast';
import type { NodeTemplate } from './data/nodeTemplates';



const STORAGE_KEY = 'synapse-flow-data';

let nodeIdCounter = 0;
function getNodeId() {
  return `node_${++nodeIdCounter}_${Date.now()}`;
}

// Bağlantı çizgilerinin görünümü
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

// Kaydedilmiş bir senaryo varsa sessionStorage'dan geri yükleme.
function loadFromStorage(): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.nodes && parsed.edges) return parsed;
    }
  } catch {
    // görmezden gel
  }
  return null;
}

function FlowEditor() {
  const saved = useMemo(() => loadFromStorage(), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(saved?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(saved?.edges || []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    setToasts((prev) => [...prev, createToast(type, message)]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // döngü kontrolü
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!isValidConnection(connection, nodes, edges)) {
        addToast('error', 'Bu bağlantı döngü oluşturur veya geçersizdir!');
        return;
      }
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: 'rgba(139, 92, 246, 0.5)', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'rgba(139, 92, 246, 0.7)',
              width: 20,
              height: 20,
            },
          },
          eds
        )
      );
      addToast('success', 'Bağlantı oluşturuldu');
    },
    [nodes, edges, setEdges, addToast]
  );

  // bağlantı kontrolü
  const handleIsValidConnection = useCallback(
    (connection: Connection | Edge) => {
      return isValidConnection(connection as Connection, nodes, edges);
    },
    [nodes, edges]
  );


  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const templateStr = event.dataTransfer.getData('application/synapse-node');
      if (!templateStr) return;

      const template: NodeTemplate = JSON.parse(templateStr);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getNodeId(),
        type: template.type,
        position,
        data: {
          label: template.label,
          description: template.description,
          icon: template.icon,
          config: { ...(template.defaultConfig || {}) },
          configFields: template.configFields || [],
        },
      };

      setNodes((nds) => [...nds, newNode]);
      addToast('info', `${template.label} düğümü eklendi`);
    },
    [screenToFlowPosition, setNodes, addToast]
  );


  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);


  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...data } } : n))
      );
      setSelectedNode((prev) =>
        prev && prev.id === nodeId ? { ...prev, data: { ...data } } : prev
      );
    },
    [setNodes]
  );

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
      );
      setSelectedNode(null);
      addToast('info', 'Düğüm silindi');
    },
    [setNodes, setEdges, addToast]
  );

  // Üst çubuk butonları
  const handleSave = useCallback(() => {
    const data = { nodes, edges };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    addToast('success', 'Senaryo kaydedildi!');
  }, [nodes, edges, addToast]);

  const handleValidate = useCallback(() => {
    const result = validateDAG(nodes, edges);
    if (result.valid) {
      addToast('success', result.message);
      if (result.order) {
        console.log('Topolojik Sıralama:', result.order);
      }
    } else {
      addToast('error', result.message);
    }
  }, [nodes, edges, addToast]);

  const handleClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    sessionStorage.removeItem(STORAGE_KEY);
    addToast('info', 'Tüm düğümler temizlendi');
  }, [setNodes, setEdges, addToast]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 500 });
  }, [fitView]);

  const handleExport = useCallback(() => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synapse-scenario.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Senaryo JSON olarak dışa aktarıldı');
  }, [nodes, edges, addToast]);

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
                Sol panelden tetikleyici ve eylem düğümlerini
                sürükleyip bu alana bırakın.
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
              nodeColor={(node) =>
                node.type === 'trigger' ? '#f59e0b' : '#8b5cf6'
              }
              maskColor="rgba(10, 10, 20, 0.8)"
              style={{
                backgroundColor: 'rgba(18, 18, 35, 0.85)',
              }}
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
