import { useTheme } from '@/Contexts/ThemeContext';

export default function FormInput({ 
    label, 
    name, 
    type = 'text', 
    value, 
    onChange, 
    error, 
    placeholder,
    required = false,
    disabled = false,
    className = '',
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={className}>
            {label && (
                <label 
                    htmlFor={name} 
                    className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-emerald-100/80' : 'text-gray-700'}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2
                    ${isDark 
                        ? `bg-emerald-950/30 border text-emerald-100 placeholder:text-emerald-500/40 
                           ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-emerald-900/50 focus:ring-emerald-500/50'}` 
                        : `bg-white border text-gray-900 placeholder:text-gray-400 
                           ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            />
            {error && (
                <p className={`mt-1 text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            )}
        </div>
    );
}

export function FormTextarea({ 
    label, 
    name, 
    value, 
    onChange, 
    error, 
    placeholder,
    required = false,
    disabled = false,
    rows = 3,
    className = '',
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={className}>
            {label && (
                <label 
                    htmlFor={name} 
                    className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-emerald-100/80' : 'text-gray-700'}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 resize-none
                    ${isDark 
                        ? `bg-emerald-950/30 border text-emerald-100 placeholder:text-emerald-500/40 
                           ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-emerald-900/50 focus:ring-emerald-500/50'}` 
                        : `bg-white border text-gray-900 placeholder:text-gray-400 
                           ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            />
            {error && (
                <p className={`mt-1 text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            )}
        </div>
    );
}

export function FormSelect({ 
    label, 
    name, 
    value, 
    onChange, 
    options = [],
    error, 
    placeholder = 'Pilih...',
    required = false,
    disabled = false,
    className = '',
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={className}>
            {label && (
                <label 
                    htmlFor={name} 
                    className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-emerald-100/80' : 'text-gray-700'}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full px-3 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2
                    ${isDark 
                        ? `bg-emerald-950/30 border text-emerald-100 
                           ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-emerald-900/50 focus:ring-emerald-500/50'}` 
                        : `bg-white border text-gray-900 
                           ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-teal-500'}`
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
            >
                <option value="">{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && (
                <p className={`mt-1 text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            )}
        </div>
    );
}
