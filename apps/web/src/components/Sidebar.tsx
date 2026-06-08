import { useState } from 'react';
import { Search } from 'lucide-react';
import { triggerTemplates, actionTemplates, type NodeTemplate } from '../data/nodeTemplates';

function Sidebar() {
    const [search, setSearch] = useState('');

    const filterTemplates = (templates: NodeTemplate[]) =>
        templates.filter(
            (t) =>
                t.label.toLowerCase().includes(search.toLowerCase()) ||
                t.description.toLowerCase().includes(search.toLowerCase())
        );

    const filteredTriggers = filterTemplates(triggerTemplates);
    const filteredActions = filterTemplates(actionTemplates);

    const onDragStart = (event: React.DragEvent, template: NodeTemplate) => {
        event.dataTransfer.setData('application/synapse-node', JSON.stringify(template));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-search-wrapper">
                    <Search className="sidebar-search-icon" size={16} />
                    <input
                        className="sidebar-search"
                        type="text"
                        placeholder="Düğüm ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="sidebar-content">
                {filteredTriggers.length > 0 && (
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Tetikleyiciler</div>
                        {filteredTriggers.map((template) => (
                            <div
                                key={template.label}
                                className="sidebar-item"
                                draggable
                                onDragStart={(e) => onDragStart(e, template)}
                            >
                                <div className="sidebar-item-icon trigger">
                                    <span>{template.icon}</span>
                                </div>
                                <div className="sidebar-item-info">
                                    <span className="sidebar-item-name">{template.label}</span>
                                    <span className="sidebar-item-desc">{template.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {filteredActions.length > 0 && (
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Eylemler</div>
                        {filteredActions.map((template) => (
                            <div
                                key={template.label}
                                className="sidebar-item"
                                draggable
                                onDragStart={(e) => onDragStart(e, template)}
                            >
                                <div className="sidebar-item-icon action">
                                    <span>{template.icon}</span>
                                </div>
                                <div className="sidebar-item-info">
                                    <span className="sidebar-item-name">{template.label}</span>
                                    <span className="sidebar-item-desc">{template.description}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {filteredTriggers.length === 0 && filteredActions.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        Sonuç bulunamadı
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;
