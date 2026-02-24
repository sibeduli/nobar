import { useState, useMemo } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { 
    Search, 
    X, 
    ChevronUp, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight,
    Filter,
    Columns,
    Check,
    MoreVertical
} from 'lucide-react';

export default function DataTable({
    data = [],
    columns = [],
    searchable = true,
    searchPlaceholder = 'Cari...',
    filterable = true,
    filters = [],
    pagination = true,
    pageSize = 10,
    pageSizeOptions = [10, 25, 50, 100],
    selectable = false,
    onSelectionChange,
    bulkActions = [],
    emptyMessage = 'Tidak ada data',
    loading = false,
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(pageSize);
    const [selectedRows, setSelectedRows] = useState([]);
    const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({});
    const [showBulkMenu, setShowBulkMenu] = useState(false);

    // Filter and search data
    const filteredData = useMemo(() => {
        let result = [...data];

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(row => 
                columns.some(col => {
                    const value = row[col.key];
                    return value && String(value).toLowerCase().includes(query);
                })
            );
        }

        // Apply filters
        Object.entries(activeFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                result = result.filter(row => row[key] === value);
            }
        });

        return result;
    }, [data, searchQuery, activeFilters, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectAll = (checked) => {
        const newSelection = checked ? paginatedData.map((_, i) => i) : [];
        setSelectedRows(newSelection);
        onSelectionChange?.(newSelection.map(i => paginatedData[i]));
    };

    const handleSelectAllData = () => {
        const allIndices = sortedData.map((_, i) => i);
        setSelectedRows(allIndices);
        onSelectionChange?.(sortedData);
    };

    const handleDeselectAll = () => {
        setSelectedRows([]);
        onSelectionChange?.([]);
    };

    const getSelectedData = () => {
        return selectedRows.map(i => sortedData[i]).filter(Boolean);
    };

    const handleSelectRow = (index, checked) => {
        const newSelection = checked 
            ? [...selectedRows, index]
            : selectedRows.filter(i => i !== index);
        setSelectedRows(newSelection);
        onSelectionChange?.(newSelection.map(i => paginatedData[i]));
    };

    const toggleColumn = (key) => {
        setVisibleColumns(prev => 
            prev.includes(key) 
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const clearSearch = () => {
        setSearchQuery('');
        setCurrentPage(1);
    };

    const handleFilterChange = (key, value) => {
        setActiveFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setActiveFilters({});
        setCurrentPage(1);
    };

    const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;

    // Pagination range
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const visibleCols = columns.filter(c => visibleColumns.includes(c.key));

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectable && selectedRows.length > 0 && (
                <div className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl
                    ${isDark ? 'bg-emerald-950/40 border border-emerald-500/30' : 'bg-teal-50 border border-teal-200'}
                `}>
                    <div className="flex items-center gap-4">
                        {/* Bulk Actions Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowBulkMenu(!showBulkMenu)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
                                    ${isDark 
                                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 ring-1 ring-emerald-500/30' 
                                        : 'bg-teal-600 text-white hover:bg-teal-700'
                                    }
                                `}
                            >
                                <MoreVertical className="w-4 h-4" />
                                Bulk actions
                            </button>
                            
                            {showBulkMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowBulkMenu(false)} />
                                    <div className={`absolute left-0 top-full mt-1 w-48 rounded-lg shadow-lg z-20 py-1
                                        ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}
                                    `}>
                                        {bulkActions.map((action, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    action.onClick(getSelectedData());
                                                    setShowBulkMenu(false);
                                                }}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                                                    ${action.variant === 'danger'
                                                        ? isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'
                                                        : isDark ? 'text-emerald-100 hover:bg-emerald-500/10' : 'text-gray-700 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                {action.icon && <action.icon className="w-4 h-4" />}
                                                <span>{action.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Selection Count */}
                        <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                            {selectedRows.length} records selected
                        </span>
                    </div>

                    {/* Select All / Deselect All */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSelectAllData}
                            className={`text-sm font-medium transition-colors
                                ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}
                            `}
                        >
                            Select all {sortedData.length}
                        </button>
                        <button
                            onClick={handleDeselectAll}
                            className={`text-sm font-medium transition-colors
                                ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}
                            `}
                        >
                            Deselect all
                        </button>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search */}
                {searchable && (
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            placeholder={searchPlaceholder}
                            className={`w-full pl-9 pr-9 py-2 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2
                                ${isDark 
                                    ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                    : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                                }
                            `}
                        />
                        {searchQuery && (
                            <button 
                                onClick={clearSearch}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors
                                    ${isDark ? 'text-emerald-500/50 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-600'}
                                `}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {/* Filters Toggle */}
                    {filterable && filters.length > 0 && (
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`relative flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                                ${isDark 
                                    ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 hover:bg-emerald-900/30' 
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                            {activeFilterCount > 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full
                                    ${isDark ? 'bg-emerald-500/30 text-emerald-400' : 'bg-teal-100 text-teal-700'}
                                `}>
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    )}

                    {/* Column Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColumnSelector(!showColumnSelector)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                                ${isDark 
                                    ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 hover:bg-emerald-900/30' 
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            <Columns className="w-4 h-4" />
                        </button>
                        
                        {showColumnSelector && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowColumnSelector(false)} />
                                <div className={`absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg z-20 py-1
                                    ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}
                                `}>
                                    <div className={`px-3 py-2 text-xs font-medium border-b
                                        ${isDark ? 'text-emerald-500/70 border-emerald-900/30' : 'text-gray-500 border-gray-100'}
                                    `}>
                                        Tampilkan Kolom
                                    </div>
                                    {columns.map(col => (
                                        <button
                                            key={col.key}
                                            onClick={() => toggleColumn(col.key)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors
                                                ${isDark ? 'text-emerald-100 hover:bg-emerald-500/10' : 'text-gray-700 hover:bg-gray-50'}
                                            `}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center
                                                ${visibleColumns.includes(col.key)
                                                    ? isDark ? 'bg-emerald-500/30 border-emerald-500/50' : 'bg-teal-500 border-teal-500'
                                                    : isDark ? 'border-emerald-900/50' : 'border-gray-300'
                                                }
                                            `}>
                                                {visibleColumns.includes(col.key) && (
                                                    <Check className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-white'}`} />
                                                )}
                                            </div>
                                            <span>{col.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && filters.length > 0 && (
                <div className={`flex flex-wrap items-center gap-3 p-4 rounded-lg
                    ${isDark ? 'bg-emerald-950/20 border border-emerald-900/30' : 'bg-gray-50 border border-gray-200'}
                `}>
                    {filters.map(filter => (
                        <div key={filter.key} className="flex items-center gap-2">
                            <label className={`text-sm ${isDark ? 'text-emerald-100/70' : 'text-gray-600'}`}>
                                {filter.label}:
                            </label>
                            <select
                                value={activeFilters[filter.key] || 'all'}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2
                                    ${isDark 
                                        ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 focus:ring-emerald-500/50' 
                                        : 'bg-white border border-gray-300 text-gray-900 focus:ring-teal-500'
                                    }
                                `}
                            >
                                <option value="all">Semua</option>
                                {filter.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors
                                ${isDark ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-teal-600 hover:bg-teal-50'}
                            `}
                        >
                            <X className="w-3 h-3" />
                            Hapus Filter
                        </button>
                    )}
                </div>
            )}

            {/* Table */}
            <div className={`rounded-xl overflow-hidden
                ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}
            `}>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}>
                                {selectable && (
                                    <th className="w-12 px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className={`w-4 h-4 rounded border transition-colors
                                                ${isDark ? 'bg-emerald-950/30 border-emerald-900/50' : 'border-gray-300'}
                                            `}
                                        />
                                    </th>
                                )}
                                {visibleCols.map(col => (
                                    <th 
                                        key={col.key}
                                        onClick={() => col.sortable !== false && handleSort(col.key)}
                                        className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider
                                            ${col.sortable !== false ? 'cursor-pointer select-none' : ''}
                                            ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}
                                        `}
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>{col.label}</span>
                                            {col.sortable !== false && sortConfig.key === col.key && (
                                                sortConfig.direction === 'asc' 
                                                    ? <ChevronUp className="w-4 h-4" />
                                                    : <ChevronDown className="w-4 h-4" />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-emerald-900/20' : 'divide-gray-100'}`}>
                            {loading ? (
                                <tr>
                                    <td colSpan={visibleCols.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleCols.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center">
                                        <p className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>{emptyMessage}</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((row, rowIndex) => (
                                    <tr 
                                        key={rowIndex}
                                        className={`transition-colors
                                            ${isDark ? 'hover:bg-emerald-500/5' : 'hover:bg-gray-50'}
                                        `}
                                    >
                                        {selectable && (
                                            <td className="w-12 px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.includes(rowIndex)}
                                                    onChange={(e) => handleSelectRow(rowIndex, e.target.checked)}
                                                    className={`w-4 h-4 rounded border transition-colors
                                                        ${isDark ? 'bg-emerald-950/30 border-emerald-900/50' : 'border-gray-300'}
                                                    `}
                                                />
                                            </td>
                                        )}
                                        {visibleCols.map(col => (
                                            <td key={col.key} className={`px-4 py-3 text-sm ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                                {col.render ? col.render(row[col.key], row) : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && sortedData.length > 0 && (
                    <div className={`flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t
                        ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}
                    `}>
                        <div className={`text-sm ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>
                            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedData.length)} dari {sortedData.length} data
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Page Size */}
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>Per halaman</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                    className={`px-2 py-1 text-sm rounded-lg transition-colors focus:outline-none
                                        ${isDark 
                                            ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100' 
                                            : 'bg-white border border-gray-300 text-gray-900'
                                        }
                                    `}
                                >
                                    {pageSizeOptions.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                        ${isDark 
                                            ? 'text-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-400' 
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }
                                    `}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                {getPageNumbers().map((page, i) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${i}`} className={`px-2 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`min-w-[32px] h-8 px-2 text-sm rounded-lg transition-colors
                                                ${currentPage === page
                                                    ? isDark 
                                                        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' 
                                                        : 'bg-teal-600 text-white'
                                                    : isDark 
                                                        ? 'text-emerald-100/70 hover:bg-emerald-500/10' 
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }
                                            `}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                        ${isDark 
                                            ? 'text-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-400' 
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                        }
                                    `}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
