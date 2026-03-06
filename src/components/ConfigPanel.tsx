import { X, Trash2 } from 'lucide-react';
import type { Node } from '@xyflow/react';

interface ConfigPanelProps {
    node: Node;
    onClose: () => void;
    onDelete: (nodeId: string) => void;
    onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
}

function ConfigPanel({ node, onClose, onDelete, onUpdate }: ConfigPanelProps) {
    const data = node.data as Record<string, unknown>;
    const config = (data.config as Record<string, string>) || {};
    const nodeType = node.type === 'trigger' ? 'Tetikleyici' : 'Eylem';

    const handleLabelChange = (value: string) => {
        onUpdate(node.id, { ...data, label: value });
    };

    const handleDescriptionChange = (value: string) => {
        onUpdate(node.id, { ...data, description: value });
    };

    const handleConfigChange = (key: string, value: string) => {
        const newConfig = { ...config, [key]: value };
        onUpdate(node.id, { ...data, config: newConfig });
    };

    return (
        <div className="config-panel">
            <div className="config-panel-header">
                <div className="config-panel-title">
                    {data.icon as string} {nodeType} Yapılandırma
                </div>
                <button className="config-panel-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>
            <div className="config-panel-body">
                <div className="config-field">
                    <label>Düğüm Adı</label>
                    <input
                        type="text"
                        value={(data.label as string) || ''}
                        onChange={(e) => handleLabelChange(e.target.value)}
                    />
                </div>
                <div className="config-field">
                    <label>Açıklama</label>
                    <textarea
                        value={(data.description as string) || ''}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        placeholder="Düğüm açıklaması ekleyin..."
                    />
                </div>
                <div className="config-field">
                    <label>Düğüm Tipi</label>
                    <input type="text" value={nodeType} disabled />
                </div>
                <div className="config-field">
                    <label>Düğüm ID</label>
                    <input
                        type="text"
                        value={node.id}
                        disabled
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
                    />
                </div>
                {Object.keys(config).length > 0 && (
                    <>
                        <div
                            style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                color: 'var(--text-muted)',
                                marginBottom: '8px',
                                marginTop: '8px',
                                paddingTop: '12px',
                                borderTop: '1px solid var(--border-subtle)',
                            }}
                        >
                            Yapılandırma Alanları
                        </div>
                        {Object.entries(config).map(([key, value]) => (
                            <div key={key} className="config-field">
                                <label>{key}</label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleConfigChange(key, e.target.value)}
                                />
                            </div>
                        ))}
                    </>
                )}
            </div>
            <div className="config-panel-footer">
                <button
                    className="config-delete-btn"
                    onClick={() => onDelete(node.id)}
                >
                    <Trash2 size={14} />
                    Düğümü Sil
                </button>
            </div>
        </div>
    );
}

export default ConfigPanel;
