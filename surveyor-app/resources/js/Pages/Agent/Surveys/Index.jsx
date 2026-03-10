import { useState } from 'react';
import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { Link, router } from '@inertiajs/react';
import {
    ClipboardList,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
    Calendar,
    Search,
    AlertTriangle,
    FileText,
    ShieldCheck,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// Report type labels
const REPORT_TYPES = {
    verified: { label: 'Terverifikasi', color: 'emerald' },
    verified_non_commercial: { label: 'Non-Komersial', color: 'emerald' },
    violation_invalid_qr: { label: 'QR Invalid', color: 'red' },
    violation_capacity: { label: 'Kapasitas', color: 'red' },
    violation_ads: { label: 'Iklan Ilegal', color: 'red' },
    violation_no_license: { label: 'Tanpa Lisensi', color: 'red' },
    violation_venue: { label: 'Venue Tidak Sesuai', color: 'red' },
    lead: { label: 'Penawaran', color: 'blue' },
    documentation: { label: 'Dokumentasi', color: 'blue' },
    other: { label: 'Lainnya', color: 'gray' },
};

export default function AgentSurveysIndex({ surveys = [], stats = {} }) {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';

    // Use props directly, not local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.visit('/agent/surveys', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Status berhasil diperbarui');
            },
            onFinish: () => {
                setIsRefreshing(false);
            },
        });
    };

    const filters = [
        { key: 'all', label: 'Semua' },
        { key: 'approved', label: 'Disetujui' },
        { key: 'pending', label: 'Pending' },
        { key: 'rejected', label: 'Ditolak' },
    ];

    const filteredSurveys = surveys.filter(survey => {
        const matchesSearch = (survey.venue_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (survey.venue_address || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || survey.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    // Pagination
    const totalPages = Math.ceil(filteredSurveys.length / itemsPerPage);
    const paginatedSurveys = filteredSurveys.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filter/search changes
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const StatusBadge = ({ status }) => {
        const config = {
            approved: { label: 'Disetujui', color: 'emerald', icon: CheckCircle },
            pending: { label: 'Pending', color: 'amber', icon: Clock },
            rejected: { label: 'Ditolak', color: 'red', icon: XCircle },
        };
        const { label, color, icon: Icon } = config[status] || config.pending;
        const colors = {
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700',
            red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
        };

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${colors[color]}`}>
                <Icon className="w-3 h-3" />
                {label}
            </span>
        );
    };

    const ReportTypeBadge = ({ type }) => {
        const config = REPORT_TYPES[type] || REPORT_TYPES.other;
        const colors = {
            emerald: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            red: isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700',
            blue: isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700',
            gray: isDark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-50 text-gray-700',
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${colors[config.color]}`}>
                {config.label}
            </span>
        );
    };

    return (
        <AgentLayout>
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Survey Saya
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>
                            {filteredSurveys.length} survey ditemukan
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isDark 
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50' 
                                : 'bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:opacity-50'
                            }
                        `}
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Perbarui Status</span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Cari nama venue atau area..."
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2
                            ${isDark 
                                ? 'bg-[#0d1414] border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                            }
                        `}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {filters.map(filter => (
                        <button
                            key={filter.key}
                            onClick={() => handleFilterChange(filter.key)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors
                                ${activeFilter === filter.key
                                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'
                                    : isDark ? 'bg-emerald-950/30 text-emerald-500/60' : 'bg-gray-100 text-gray-600'
                                }
                            `}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Survey List */}
                <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    {paginatedSurveys.length > 0 ? (
                        <div className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                            {paginatedSurveys.map(survey => (
                                <Link
                                    key={survey.id}
                                    href={`/agent/surveys/${survey.id}`}
                                    className={`block p-4 transition-colors ${isDark ? 'hover:bg-emerald-500/5' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                                {survey.venue_name || 'Unknown Venue'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <ReportTypeBadge type={survey.report_type} />
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                {survey.venue_address && (
                                                    <>
                                                        <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="truncate max-w-[150px]">{survey.venue_address}</span>
                                                        </span>
                                                        <span className={`text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>•</span>
                                                    </>
                                                )}
                                                <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                    <Calendar className="w-3 h-3" />
                                                    {survey.created_at ? new Date(survey.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                        <StatusBadge status={survey.status} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <ClipboardList className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-emerald-500/40' : 'text-gray-300'}`} />
                            <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                {searchQuery || activeFilter !== 'all' ? 'Tidak ada survey ditemukan' : 'Belum ada survey. Buat laporan baru!'}
                            </p>
                            {!searchQuery && activeFilter === 'all' && (
                                <Link
                                    href="/agent/report"
                                    className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-emerald-500 text-white' : 'bg-teal-600 text-white'}`}
                                >
                                    <FileText className="w-4 h-4" />
                                    Buat Laporan
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination - Always visible */}
                <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        Menampilkan {paginatedSurveys.length} dari {filteredSurveys.length} data
                    </p>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Hal {currentPage}/{Math.max(1, totalPages)}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-40
                                ${isDark 
                                    ? 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-500/20 disabled:hover:bg-emerald-950/30' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:hover:bg-gray-100'
                                }
                            `}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-40
                                ${isDark 
                                    ? 'bg-emerald-950/30 text-emerald-400 hover:bg-emerald-500/20 disabled:hover:bg-emerald-950/30' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:hover:bg-gray-100'
                                }
                            `}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </AgentLayout>
    );
}
