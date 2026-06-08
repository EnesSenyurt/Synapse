import { useCallback } from 'react';
import {
  addEdge,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type XYPosition,
} from '@xyflow/react';
import { isValidConnection } from '../utils/dagUtils';
import type { NodeTemplate } from '../data/nodeTemplates';
import type { AddToast } from './useToasts';

let nodeIdCounter = 0;
function getNodeId() {
  return `node_${++nodeIdCounter}_${Date.now()}`;
}

interface UseFlowHandlersArgs {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>;
  addToast: AddToast;
  screenToFlowPosition: (position: XYPosition) => XYPosition;
}

export function useFlowHandlers({
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedNode,
  addToast,
  screenToFlowPosition,
}: UseFlowHandlersArgs) {
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
          eds,
        ),
      );
      addToast('success', 'Bağlantı oluşturuldu');
    },
    [nodes, edges, setEdges, addToast],
  );

  const handleIsValidConnection = useCallback(
    (connection: Connection | Edge) => {
      return isValidConnection(connection as Connection, nodes, edges);
    },
    [nodes, edges],
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
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

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
    [screenToFlowPosition, setNodes, addToast],
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    [setSelectedNode],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const handleNodeUpdate = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...data } } : n)),
      );
      setSelectedNode((prev) =>
        prev && prev.id === nodeId ? { ...prev, data: { ...data } } : prev,
      );
    },
    [setNodes, setSelectedNode],
  );

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) =>
        eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
      );
      setSelectedNode(null);
      addToast('info', 'Düğüm silindi');
    },
    [setNodes, setEdges, setSelectedNode, addToast],
  );

  return {
    onConnect,
    handleIsValidConnection,
    onDragOver,
    onDrop,
    onNodeClick,
    onPaneClick,
    handleNodeUpdate,
    handleNodeDelete,
  };
}
