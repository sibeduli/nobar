import { useTheme } from '@/Contexts/ThemeContext';

export default function Button({ 
    children, 
    type = 'button', 
    variant = 'primary', 
    size = 'md',
    disabled = false,
    loading = false,
    onClick,
    className = '',
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const variants = {
        primary: isDark 
            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 ring-1 ring-emerald-500/30' 
            : 'bg-teal-600 text-white hover:bg-teal-700',
        secondary: isDark 
            ? 'bg-emerald-950/50 text-emerald-100/70 hover:bg-emerald-900/50 ring-1 ring-emerald-900/50' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        danger: isDark 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 ring-1 ring-red-500/30' 
            : 'bg-red-600 text-white hover:bg-red-700',
        ghost: isDark 
            ? 'text-emerald-100/70 hover:bg-emerald-500/10 hover:text-emerald-300' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-2.5 text-base',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors
                ${variants[variant]}
                ${sizes[size]}
                ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {loading && (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
}
