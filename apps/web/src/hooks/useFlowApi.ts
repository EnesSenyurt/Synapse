import { useCallback, useEffect, useState } from 'react';
import type { Edge, Node } from '@xyflow/react';
import type { Flow, GraphEdge, GraphNode } from '@synapse/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const CURRENT_FLOW_KEY = 'synapse-current-flow-id';

export interface UseFlowApiState {
  flowId: string | null;
  initialNodes: Node[];
  initialEdges: Edge[];
  ready: boolean;
  error: string | null;
}

async function fetchFlow(id: string): Promise<Flow | null> {
  const res = await fetch(`${API_URL}/flows/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /flows/${id} failed: ${res.status}`);
  return (await res.json()) as Flow;
}

async function createFlow(name = 'Untitled Flow'): Promise<Flow> {
  const res = await fetch(`${API_URL}/flows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`POST /flows failed: ${res.status}`);
  return (await res.json()) as Flow;
}

async function putFlow(id: string, body: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const res = await fetch(`${API_URL}/flows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT /flows/${id} failed: ${res.status}`);
  return (await res.json()) as Flow;
}

export function useFlowApi() {
  const [state, setState] = useState<UseFlowApiState>({
    flowId: null,
    initialNodes: [],
    initialEdges: [],
    ready: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const storedId = localStorage.getItem(CURRENT_FLOW_KEY);
        let flow: Flow | null = null;
        if (storedId) {
          flow = await fetchFlow(storedId);
        }
        if (!flow) {
          flow = await createFlow();
          localStorage.setItem(CURRENT_FLOW_KEY, flow.id);
        }
        if (cancelled) return;
        setState({
          flowId: flow.id,
          initialNodes: flow.nodes as unknown as Node[],
          initialEdges: flow.edges as unknown as Edge[],
          ready: true,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          ready: true,
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      if (!state.flowId) throw new Error('Flow henüz hazır değil');
      await putFlow(state.flowId, {
        nodes: nodes as unknown as GraphNode[],
        edges: edges as unknown as GraphEdge[],
      });
    },
    [state.flowId]
  );

  const clear = useCallback(async () => {
    if (!state.flowId) throw new Error('Flow henüz hazır değil');
    await putFlow(state.flowId, { nodes: [], edges: [] });
  }, [state.flowId]);

  return { ...state, save, clear };
}
