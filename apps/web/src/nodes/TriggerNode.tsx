import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

export type TriggerNodeData = {
    label: string;
    description?: string;
    icon?: string;
    config?: Record<string, string>;
};

type TriggerNode = Node<TriggerNodeData, 'trigger'>;

function TriggerNodeComponent({ data, selected }: NodeProps<TriggerNode>) {
    return (
        <div className={`synapse-node trigger ${selected ? 'selected' : ''}`}>
            <div className="node-header trigger">
                <div className="node-header-icon trigger">
                    <span>{data.icon || '⚡'}</span>
                </div>
                <span className="node-header-label trigger">Tetikleyici</span>
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
                style={{ background: '#f59e0b' }}
            />
        </div>
    );
}

export default memo(TriggerNodeComponent);
