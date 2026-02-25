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
    ArrowRight,
    AlertTriangle,
    TrendingUp,
} from 'lucide-react';

// Mock data
const mockStats = {
    totalSurveys: 45,
    approved: 38,
    pending: 5,
    rejected: 2,
};

const mockRecentSurveys = [
    { id: 1, venueName: 'Warkop Bola Mania', area: 'Jakarta Selatan', status: 'approved', date: '2024-03-10' },
    { id: 2, venueName: 'Resto Piala Dunia', area: 'Jakarta Barat', status: 'pending', date: '2024-03-10' },
    { id: 3, venueName: 'Kedai Kopi Stadium', area: 'Jakarta Timur', status: 'approved', date: '2024-03-09' },
];

const mockAssignedAreas = ['Jakarta Selatan', 'Jakarta Pusat'];

export default function AgentDashboard() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

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
            <div className="space-y-6">
                {/* Welcome Header */}
                <div>
                    <h1 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Selamat Datang! 👋
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>
                        Klik tombol + untuk membuat survey baru
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                <ClipboardList className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{mockStats.totalSurveys}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Total Survey</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                <CheckCircle className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{mockStats.approved}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Disetujui</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                                <Clock className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{mockStats.pending}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                <XCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{mockStats.rejected}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Ditolak</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assigned Areas */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                        <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Area Tugas Anda</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {mockAssignedAreas.map((area, idx) => (
                            <span
                                key={idx}
                                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg
                                    ${isDark 
                                        ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' 
                                        : 'bg-teal-50 text-teal-700'
                                    }
                                `}
                            >
                                {area}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Recent Surveys */}
                <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}`}>
                        <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Survey Terakhir Anda</h2>
                        <Link 
                            href="/agent/surveys"
                            className={`flex items-center gap-1 text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}
                        >
                            Lihat Semua
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                        {mockRecentSurveys.map(survey => (
                            <Link
                                key={survey.id}
                                href={`/agent/surveys/${survey.id}`}
                                className={`block p-4 transition-colors ${isDark ? 'hover:bg-emerald-500/5' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{survey.venueName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{survey.area}</span>
                                            <span className={`text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>•</span>
                                            <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                {new Date(survey.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                    <StatusBadge status={survey.status} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AgentLayout>
    );
}
