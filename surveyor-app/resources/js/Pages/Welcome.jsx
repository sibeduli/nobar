import { Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { 
    Users, 
    ClipboardList, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    XCircle,
    Eye,
    ArrowRight,
    MapPin,
    Calendar,
    MousePointerClick
} from 'lucide-react';

// Mock data for dashboard
const recentSurveys = [
    { id: 1, venueName: 'Warkop Bola Mania', venueType: 'Cafe/Warkop', area: 'Jakarta Selatan', status: 'approved', surveyDate: '2024-03-10' },
    { id: 2, venueName: 'Resto Piala Dunia', venueType: 'Restoran', area: 'Jakarta Barat', status: 'approved', surveyDate: '2024-03-10' },
    { id: 3, venueName: 'Kedai Kopi Stadium', venueType: 'Cafe/Warkop', area: 'Jakarta Timur', status: 'pending', surveyDate: '2024-03-10' },
];

const recentViolations = [
    { id: 101, venueName: 'Warkop Bola Mania', violationType: 'capacity_exceeded', status: 'open', reportDate: '2024-03-15' },
    { id: 102, venueName: 'Kedai Malam Jaya', violationType: 'ads_violation', status: 'open', reportDate: '2024-03-14' },
    { id: 103, venueName: 'Resto Piala Dunia', violationType: 'capacity_exceeded', status: 'resolved', reportDate: '2024-03-12' },
];

const recentAgentActivities = [
    { id: 1, agentName: 'Ahmad Sudrajat', action: 'Melakukan survey', target: 'Warkop Bola Mania', timestamp: '2024-03-10T14:30:00' },
    { id: 2, agentName: 'Budi Santoso', action: 'Melaporkan pelanggaran', target: 'Kedai Malam Jaya', timestamp: '2024-03-10T13:15:00' },
    { id: 3, agentName: 'Citra Dewi', action: 'Melakukan survey', target: 'Kedai Kopi Stadium', timestamp: '2024-03-10T11:00:00' },
];

const recentPICActivities = [
    { id: 1, action: 'Menyetujui survey', target: 'Warkop Bola Mania', page: '/surveys', timestamp: '2024-03-10T15:00:00' },
    { id: 2, action: 'Melihat peta venue', target: null, page: '/venues/map', timestamp: '2024-03-10T14:45:00' },
    { id: 3, action: 'Export data survey', target: null, page: '/surveys', timestamp: '2024-03-10T14:30:00' },
];

const stats = {
    totalSurveys: 12,
    approved: 9,
    pending: 3,
    totalAgents: 8,
    activeAgents: 6,
    openViolations: 3,
};

const violationTypeLabels = {
    capacity_exceeded: 'Melebihi Kapasitas',
    ads_violation: 'Pelanggaran Iklan',
    other: 'Lainnya',
};

export default function Welcome() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const StatusBadge = ({ status }) => {
        const config = {
            approved: { label: 'Disetujui', color: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
            pending: { label: 'Pending', color: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700', icon: Clock },
            rejected: { label: 'Ditolak', color: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700', icon: XCircle },
            open: { label: 'Terbuka', color: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700', icon: AlertTriangle },
            resolved: { label: 'Selesai', color: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
        };
        const { label, color, icon: Icon } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>
                <Icon className="w-3 h-3" />
                {label}
            </span>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Dashboard
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        Selamat datang di Surveyor Portal - Nobar Piala Dunia 2026
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                <ClipboardList className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.totalSurveys}</p>
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
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.approved}</p>
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
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.pending}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.openViolations}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Pelanggaran Terbuka</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Surveys */}
                    <div className={`rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}">
                            <div>
                                <h2 className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Survey Terbaru</h2>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>3 survey terakhir</p>
                            </div>
                            <Link 
                                href="/surveys" 
                                className={`flex items-center gap-1 text-sm ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}
                            >
                                Lihat Semua
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                            {recentSurveys.map(survey => (
                                <div key={survey.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}`}>
                                            <ClipboardList className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                                        </div>
                                        <div>
                                            <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{survey.venueName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{survey.venueType}</span>
                                                <span className={`text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-300'}`}>•</span>
                                                <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{survey.area}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge status={survey.status} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Violations */}
                    <div className={`rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}">
                            <div>
                                <h2 className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Pelanggaran Terbaru</h2>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>3 pelanggaran terakhir</p>
                            </div>
                            <Link 
                                href="/surveys?tab=violations" 
                                className={`flex items-center gap-1 text-sm ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}
                            >
                                Lihat Semua
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                            {recentViolations.map(violation => (
                                <div key={violation.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                                            <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                                        </div>
                                        <div>
                                            <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{violation.venueName}</p>
                                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                {violationTypeLabels[violation.violationType]}
                                            </p>
                                        </div>
                                    </div>
                                    <StatusBadge status={violation.status} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activities Grid - Agent & PIC side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Agent Activities */}
                    <div className={`rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}">
                            <div>
                                <h2 className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Aktivitas Agen</h2>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>3 aktivitas agen terakhir</p>
                            </div>
                            <Link 
                                href="/agents/activities" 
                                className={`flex items-center gap-1 text-sm ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}
                            >
                                Lihat Semua
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                            {recentAgentActivities.map(activity => (
                                <div key={activity.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'}`}>
                                            {activity.agentName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{activity.agentName}</p>
                                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                {activity.action} - <span className="font-medium">{activity.target}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                        {new Date(activity.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PIC Activities */}
                    <div className={`rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}">
                            <div>
                                <h2 className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Aktivitas PIC</h2>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>3 aktivitas Anda terakhir</p>
                            </div>
                            <Link 
                                href="/pic/activities" 
                                className={`flex items-center gap-1 text-sm ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}
                            >
                                Lihat Semua
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                            {recentPICActivities.map(activity => (
                                <div key={activity.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                            <MousePointerClick className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                        </div>
                                        <div>
                                            <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{activity.action}</p>
                                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                {activity.target ? activity.target : activity.page}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                        {new Date(activity.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
