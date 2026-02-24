import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onClose }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info,
    };

    const colors = {
        success: {
            dark: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
            light: 'bg-emerald-50 border-emerald-200 text-emerald-700',
            icon: isDark ? 'text-emerald-400' : 'text-emerald-500',
        },
        error: {
            dark: 'bg-red-500/20 border-red-500/30 text-red-400',
            light: 'bg-red-50 border-red-200 text-red-700',
            icon: isDark ? 'text-red-400' : 'text-red-500',
        },
        warning: {
            dark: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
            light: 'bg-amber-50 border-amber-200 text-amber-700',
            icon: isDark ? 'text-amber-400' : 'text-amber-500',
        },
        info: {
            dark: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
            light: 'bg-blue-50 border-blue-200 text-blue-700',
            icon: isDark ? 'text-blue-400' : 'text-blue-500',
        },
    };

    const Icon = icons[toast.type];
    const colorClass = isDark ? colors[toast.type].dark : colors[toast.type].light;

    return (
        <div 
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in
                ${colorClass}
            `}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors[toast.type].icon}`} />
            <p className="text-sm flex-1">{toast.message}</p>
            <button 
                onClick={onClose}
                className={`p-0.5 rounded transition-colors hover:opacity-70`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
