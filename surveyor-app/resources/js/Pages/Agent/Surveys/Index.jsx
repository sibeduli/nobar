import { useState } from 'react';
import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { Link } from '@inertiajs/react';
import {
    ClipboardList,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
    Calendar,
    Search,
    Filter,
    ChevronDown,
} from 'lucide-react';

// Mock data
const mockSurveys = [
    { id: 1, venueName: 'Warkop Bola Mania', venueType: 'Cafe/Warkop', area: 'Jakarta Selatan', status: 'approved', date: '2024-03-10' },
    { id: 2, venueName: 'Resto Piala Dunia', venueType: 'Restoran', area: 'Jakarta Barat', status: 'approved', date: '2024-03-10' },
    { id: 3, venueName: 'Kedai Kopi Stadium', venueType: 'Cafe/Warkop', area: 'Jakarta Timur', status: 'pending', date: '2024-03-10' },
    { id: 4, venueName: 'Bar Kick Off', venueType: 'Bar', area: 'Jakarta Selatan', status: 'rejected', date: '2024-03-09' },
    { id: 5, venueName: 'Hotel Grand Sport', venueType: 'Hotel/Penginapan', area: 'Tangerang', status: 'approved', date: '2024-03-09' },
    { id: 6, venueName: 'Lapangan Futsal Jaya', venueType: 'Venue Olahraga', area: 'Depok', status: 'approved', date: '2024-03-08' },
    { id: 7, venueName: 'Balai RW 05 Menteng', venueType: 'Balai Warga', area: 'Jakarta Pusat', status: 'approved', date: '2024-03-08' },
    { id: 8, venueName: 'Cafe Nonton Bareng', venueType: 'Cafe/Warkop', area: 'Bogor', status: 'pending', date: '2024-03-07' },
];

export default function AgentSurveysIndex() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { key: 'all', label: 'Semua' },
        { key: 'approved', label: 'Disetujui' },
        { key: 'pending', label: 'Pending' },
        { key: 'rejected', label: 'Ditolak' },
    ];

    const filteredSurveys = mockSurveys.filter(survey => {
        const matchesSearch = survey.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            survey.area.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || survey.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const StatusBadge = ({ status }) => {
        const config = {
            approved: { label: 'Disetujui', color: 'emerald', icon: CheckCircle },
            pending: { label: 'Pending', color: 'amber', icon: Clock },
            rejected: { label: 'Ditolak', color: 'red', icon: XCircle },
        };
        const { label, color, icon: Icon } = config[status];
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

    return (
        <AgentLayout>
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h1 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Survey Saya
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>
                        {filteredSurveys.length} survey ditemukan
                    </p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                            onClick={() => setActiveFilter(filter.key)}
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
                    {filteredSurveys.length > 0 ? (
                        <div className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                            {filteredSurveys.map(survey => (
                                <Link
                                    key={survey.id}
                                    href={`/agent/surveys/${survey.id}`}
                                    className={`block p-4 transition-colors ${isDark ? 'hover:bg-emerald-500/5' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                                {survey.venueName}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                {survey.venueType}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                    <MapPin className="w-3 h-3" />
                                                    {survey.area}
                                                </span>
                                                <span className={`text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>•</span>
                                                <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(survey.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
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
                                Tidak ada survey ditemukan
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AgentLayout>
    );
}
