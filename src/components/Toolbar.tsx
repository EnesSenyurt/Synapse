import {
    Save,
    CheckCircle,
    Trash2,
    Maximize,
    Download,
    Zap,
} from 'lucide-react';

interface ToolbarProps {
    onSave: () => void;
    onValidate: () => void;
    onClear: () => void;
    onFitView: () => void;
    onExport: () => void;
    nodeCount: number;
    edgeCount: number;
}

function Toolbar({
    onSave,
    onValidate,
    onClear,
    onFitView,
    onExport,
    nodeCount,
    edgeCount,
}: ToolbarProps) {
    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <div className="toolbar-logo">
                    <div className="logo-icon">
                        <Zap size={16} />
                    </div>
                    <span>Synapse</span>
                </div>
                <div className="toolbar-divider" />
                <div className="toolbar-status">
                    <span className="status-dot" />
                    <span>
                        {nodeCount} düğüm · {edgeCount} bağlantı
                    </span>
                </div>
            </div>
            <div className="toolbar-actions">
                <button className="toolbar-btn" onClick={onFitView} title="Görünüme Sığdır">
                    <Maximize size={15} />
                    <span>Sığdır</span>
                </button>
                <button className="toolbar-btn success" onClick={onValidate} title="DAG Doğrula">
                    <CheckCircle size={15} />
                    <span>Doğrula</span>
                </button>
                <button className="toolbar-btn primary" onClick={onSave} title="Kaydet">
                    <Save size={15} />
                    <span>Kaydet</span>
                </button>
                <button className="toolbar-btn" onClick={onExport} title="JSON Dışa Aktar">
                    <Download size={15} />
                    <span>Dışa Aktar</span>
                </button>
                <button className="toolbar-btn danger" onClick={onClear} title="Tümünü Temizle">
                    <Trash2 size={15} />
                    <span>Temizle</span>
                </button>
            </div>
        </div>
    );
}

export default Toolbar;
