import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

export default function Modal({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md',
    showCloseButton = true 
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div 
                    className={`relative w-full ${sizeClasses[size]} transform transition-all
                        ${isDark 
                            ? 'bg-[#0d1414] border border-emerald-900/30' 
                            : 'bg-white border border-gray-200'
                        } rounded-xl shadow-xl
                    `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    {title && (
                        <div className={`flex items-center justify-between px-6 py-4 border-b
                            ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}
                        `}>
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                {title}
                            </h3>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className={`p-1 rounded-lg transition-colors
                                        ${isDark 
                                            ? 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10' 
                                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}
                    
                    {/* Content */}
                    <div className="px-6 py-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Konfirmasi', 
    message, 
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    variant = 'danger'
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const variantClasses = {
        danger: isDark 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/30' 
            : 'bg-red-600 text-white hover:bg-red-700',
        warning: isDark 
            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 ring-1 ring-amber-500/30' 
            : 'bg-amber-600 text-white hover:bg-amber-700',
        primary: isDark 
            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 ring-1 ring-emerald-500/30' 
            : 'bg-teal-600 text-white hover:bg-teal-700',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <p className={`text-sm ${isDark ? 'text-emerald-100/70' : 'text-gray-600'}`}>
                    {message}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
                            ${isDark 
                                ? 'text-emerald-100/70 hover:bg-emerald-500/10' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }
                        `}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${variantClasses[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
