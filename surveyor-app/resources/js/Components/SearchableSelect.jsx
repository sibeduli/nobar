import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Search, X, ChevronDown, Check } from 'lucide-react';

export default function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = 'Pilih...',
    searchPlaceholder = 'Cari...',
    label,
    required = false,
    error,
    disabled = false,
    className = '',
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setSearchQuery('');
    };

    return (
        <div className={className}>
            {label && (
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div ref={containerRef} className="relative">
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        ${error
                            ? 'border-red-500 focus:ring-red-500'
                            : isDark 
                                ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 hover:border-emerald-500/50 focus:ring-emerald-500/50' 
                                : 'bg-white border border-gray-300 text-gray-900 hover:border-teal-400 focus:ring-teal-500'
                        }
                        focus:outline-none focus:ring-2
                    `}
                >
                    <span className={selectedOption ? '' : isDark ? 'text-emerald-500/40' : 'text-gray-400'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <div className="flex items-center gap-1">
                        {value && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className={`p-0.5 rounded transition-colors
                                    ${isDark ? 'hover:bg-emerald-500/20 text-emerald-500/60' : 'hover:bg-gray-200 text-gray-400'}
                                `}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                    </div>
                </button>

                {/* Dropdown */}
                {isOpen && (
                    <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden
                        ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}
                    `}>
                        {/* Search Input */}
                        <div className={`p-2 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}`}>
                            <div className="relative">
                                <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className={`w-full pl-8 pr-3 py-1.5 text-sm rounded-md transition-colors focus:outline-none focus:ring-1
                                        ${isDark 
                                            ? 'bg-emerald-950/50 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                                        }
                                    `}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded
                                            ${isDark ? 'text-emerald-500/50 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-600'}
                                        `}
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="max-h-60 overflow-y-auto">
                            {filteredOptions.length === 0 ? (
                                <div className={`px-3 py-4 text-sm text-center ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                    Tidak ada hasil
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = option.value === value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors
                                                ${isSelected
                                                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-50 text-teal-700'
                                                    : isDark ? 'text-emerald-100 hover:bg-emerald-500/10' : 'text-gray-700 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <span>{option.label}</span>
                                            {isSelected && <Check className="w-4 h-4" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
}
