import { useState } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Eye, EyeOff } from 'lucide-react';

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
    icon: Icon,
    variant = 'default', // 'default' | 'amber'
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const variantStyles = {
        default: {
            label: isDark ? 'text-emerald-100' : 'text-gray-700',
            icon: isDark ? 'text-emerald-500/60' : 'text-gray-400',
            input: isDark 
                ? 'bg-[#0d1414] text-emerald-50 placeholder-emerald-500/40' 
                : 'bg-white text-gray-900 placeholder-gray-400',
            border: error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : isDark 
                    ? 'border-emerald-900/50 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20' 
                    : 'border-gray-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20',
        },
        amber: {
            label: isDark ? 'text-amber-300' : 'text-amber-800',
            icon: isDark ? 'text-amber-400/60' : 'text-amber-500',
            input: isDark 
                ? 'bg-[#0d1414] text-emerald-50 placeholder-emerald-500/40' 
                : 'bg-white text-gray-900 placeholder-gray-400',
            border: error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                : isDark 
                    ? 'border-amber-500/30 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20' 
                    : 'border-amber-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20',
        },
    };

    const styles = variantStyles[variant] || variantStyles.default;

    return (
        <div className={className}>
            {label && (
                <label 
                    htmlFor={name} 
                    className={`block text-sm font-medium mb-1.5 ${styles.label}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${styles.icon}`} />
                )}
                <input
                    type={inputType}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full rounded-xl border py-3 text-sm transition-colors
                        ${Icon ? 'pl-11' : 'pl-4'} 
                        ${isPassword ? 'pr-11' : 'pr-4'}
                        ${styles.input}
                        ${styles.border}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-1.5 text-xs text-red-500">{error}</p>
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
