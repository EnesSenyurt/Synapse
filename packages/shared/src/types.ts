export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

export interface NodeTemplate {
  type: 'trigger' | 'action';
  label: string;
  description: string;
  icon: string;
  defaultConfig?: Record<string, string>;
  configFields?: ConfigField[];
}

export interface NodeData {
  label: string;
  description: string;
  icon: string;
  config: Record<string, string>;
  configFields: ConfigField[];
  [key: string]: unknown;
}

export interface GraphNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: NodeData;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface GraphConnection {
  source: string | null;
  target: string | null;
}

export interface FlowData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface FlowSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flow extends FlowSummary, FlowData {}
