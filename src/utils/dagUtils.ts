import type { Node, Edge, Connection } from '@xyflow/react';

export function wouldCreateCycle(
  nodes: Node[],
  edges: Edge[],
  newEdge: { source: string; target: string }
): boolean {
  if (newEdge.source === newEdge.target) return true;

  const adjacency = new Map<string, string[]>();
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }
  for (const edge of edges) {
    const list = adjacency.get(edge.source);
    if (list) list.push(edge.target);
  }
  const sourceList = adjacency.get(newEdge.source);
  if (sourceList) sourceList.push(newEdge.target);

  const visited = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (nodeId === newEdge.source) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (dfs(neighbor)) return true;
    }
    return false;
  }

  return dfs(newEdge.target);
}

export function isValidConnection(
  connection: Connection,
  nodes: Node[],
  edges: Edge[]
): boolean {
  if (!connection.source || !connection.target) return false;
  if (connection.source === connection.target) return false;

  const duplicate = edges.some(
    (e) => e.source === connection.source && e.target === connection.target
  );
  if (duplicate) return false;

  return !wouldCreateCycle(nodes, edges, {
    source: connection.source,
    target: connection.target,
  });
}

export function validateDAG(
  nodes: Node[],
  edges: Edge[]
): { valid: boolean; message: string; order?: string[] } {
  if (nodes.length === 0) {
    return { valid: false, message: 'Grafta hiçbir düğüm yok.' };
  }

  const result = topologicalSort(nodes, edges);
  if (result === null) {
    return { valid: false, message: 'Grafta döngü tespit edildi!' };
  }

  const connectedNodes = new Set<string>();
  for (const edge of edges) {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  }
  const disconnected = nodes.filter((n) => !connectedNodes.has(n.id));

  if (disconnected.length > 0 && disconnected.length < nodes.length) {
    return {
      valid: true,
      message: `DAG geçerli! Topolojik sıralama başarılı. (${disconnected.length} bağlantısız düğüm var)`,
      order: result,
    };
  }

  return {
    valid: true,
    message: `DAG geçerli! ${result.length} düğüm başarıyla sıralandı.`,
    order: result,
  };
}

export function topologicalSort(
  nodes: Node[],
  edges: Edge[]
): string[] | null {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    const list = adjacency.get(edge.source);
    if (list) list.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }

  const sorted: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    const neighbors = adjacency.get(current) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  if (sorted.length !== nodes.length) return null;

  return sorted;
}
