import { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icons = {
        success: <CheckCircle size={16} />,
        error: <AlertCircle size={16} />,
        warning: <AlertTriangle size={16} />,
        info: <Info size={16} />,
    };

    return (
        <div className={`toast ${toast.type}`}>
            {icons[toast.type]}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    opacity: 0.6,
                }}
            >
                <X size={14} />
            </button>
        </div>
    );
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

export default ToastContainer;

let toastCounter = 0;
export function createToast(type: ToastType, message: string): ToastMessage {
    return { id: `toast-${++toastCounter}-${Date.now()}`, type, message };
}
