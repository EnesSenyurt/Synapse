import { useCallback } from 'react';
import type { Edge, FitViewOptions, Node } from '@xyflow/react';
import { validateDAG } from '../utils/dagUtils';
import type { AddToast } from './useToasts';

interface UseToolbarActionsArgs {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>;
  addToast: AddToast;
  storageSave: () => void;
  storageClear: () => void;
  fitView: (options?: FitViewOptions) => Promise<boolean>;
}

export function useToolbarActions({
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedNode,
  addToast,
  storageSave,
  storageClear,
  fitView,
}: UseToolbarActionsArgs) {
  const handleSave = useCallback(() => {
    storageSave();
    addToast('success', 'Senaryo kaydedildi!');
  }, [storageSave, addToast]);

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
    storageClear();
    addToast('info', 'Tüm düğümler temizlendi');
  }, [setNodes, setEdges, setSelectedNode, storageClear, addToast]);

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

  return { handleSave, handleValidate, handleClear, handleFitView, handleExport };
}
