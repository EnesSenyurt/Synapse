import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type ActionNodeData = {
    label: string;
    description?: string;
    icon?: string;
    config?: Record<string, string>;
};

type ActionNode = Node<ActionNodeData, 'action'>;

function ActionNodeComponent({ data, selected }: NodeProps<ActionNode>) {
    return (
        <div className={`synapse-node action ${selected ? 'selected' : ''}`}>
            <Handle
                type="target"
                position={Position.Top}
                style={{ background: '#8b5cf6' }}
            />
            <div className="node-header action">
                <div className="node-header-icon action">
                    <span>{data.icon || '⚙️'}</span>
                </div>
                <span className="node-header-label action">Eylem</span>
            </div>
            <div className="node-body">
                <div className="node-title">{data.label}</div>
                {data.description && (
                    <div className="node-description">{data.description}</div>
                )}
                {data.config && Object.keys(data.config).length > 0 && (
                    <div className="node-config">
                        {Object.entries(data.config).map(([key, value]) => (
                            <div key={key} className="node-config-item">
                                <span className="config-key">{key}:</span>
                                <span className="config-value">{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                style={{ background: '#8b5cf6' }}
            />
        </div>
    );
}

export default memo(ActionNodeComponent);
