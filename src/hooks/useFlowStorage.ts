import { useEffect, useRef, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';

const STORAGE_KEY = 'synapse-flow-data';

export function loadFromStorage(): { nodes: Node[]; edges: Edge[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        return parsed;
      }
    }
  } catch {
    // bozuk veri — görmezden gel
  }
  return null;
}

export function useFlowStorage(nodes: Node[], edges: Edge[]) {
  const isFirstRender = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // İlk render'dan sonra her değişiklikte otomatik kayıt (1 sn debounce)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
    }, 1000);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [nodes, edges]);

  const save = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
  }, [nodes, edges]);

  const clear = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { save, clear };
}
