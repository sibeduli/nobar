import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import DataTable from '@/Components/DataTable';
import {
    MousePointerClick,
    LogIn,
    LogOut,
    Eye,
    Edit3,
    Trash2,
    Download,
    CheckCircle,
    XCircle,
    FileText,
    Users,
    Map,
    MessageSquare,
    Settings,
} from 'lucide-react';

// Activity types with icons and colors
const activityTypes = {
    login: { label: 'Login', icon: LogIn, color: 'blue' },
    logout: { label: 'Logout', icon: LogOut, color: 'gray' },
    view_survey: { label: 'Lihat Survey', icon: Eye, color: 'cyan' },
    approve_survey: { label: 'Setujui Survey', icon: CheckCircle, color: 'emerald' },
    reject_survey: { label: 'Tolak Survey', icon: XCircle, color: 'red' },
    export_data: { label: 'Export Data', icon: Download, color: 'purple' },
    view_agent: { label: 'Lihat Agen', icon: Users, color: 'cyan' },
    edit_agent: { label: 'Edit Agen', icon: Edit3, color: 'amber' },
    delete_agent: { label: 'Hapus Agen', icon: Trash2, color: 'red' },
    create_agent: { label: 'Tambah Agen', icon: Users, color: 'emerald' },
    view_map: { label: 'Lihat Peta', icon: Map, color: 'teal' },
    send_message: { label: 'Kirim Pesan', icon: MessageSquare, color: 'blue' },
    update_settings: { label: 'Update Pengaturan', icon: Settings, color: 'gray' },
    view_report: { label: 'Lihat Laporan', icon: FileText, color: 'indigo' },
};

// Mock current user's activity data (single logged-in PIC)
const mockActivities = [
    { id: 1, activityType: 'login', description: 'Login ke sistem', page: '/login', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T08:30:00' },
    { id: 2, activityType: 'view_survey', description: 'Membuka halaman Data Survey', page: '/surveys', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T08:32:00' },
    { id: 3, activityType: 'view_survey', description: 'Melihat detail survey "Warkop Bola Mania"', page: '/surveys', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T08:35:00' },
    { id: 4, activityType: 'approve_survey', description: 'Menyetujui survey "Warkop Bola Mania"', page: '/surveys', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T08:36:00' },
    { id: 5, activityType: 'approve_survey', description: 'Menyetujui survey "Resto Piala Dunia"', page: '/surveys', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T08:40:00' },
    { id: 6, activityType: 'reject_survey', description: 'Menolak survey "Bar Kick Off" - Izin tidak lengkap', page: '/surveys', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T08:45:00' },
    { id: 7, activityType: 'view_agent', description: 'Membuka halaman Lihat Agen', page: '/agents', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T09:00:00' },
    { id: 8, activityType: 'create_agent', description: 'Menambahkan agen baru "Ahmad Sudrajat"', page: '/agents/create', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T09:15:00' },
    { id: 9, activityType: 'edit_agent', description: 'Mengubah data agen "Budi Santoso"', page: '/agents', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T09:30:00' },
    { id: 10, activityType: 'view_map', description: 'Membuka halaman Peta Venue', page: '/venues/map', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T10:00:00' },
    { id: 11, activityType: 'export_data', description: 'Export data survey ke Excel', page: '/surveys', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T10:30:00' },
    { id: 12, activityType: 'send_message', description: 'Mengirim pesan ke Pusat Bantuan', page: '/help', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T11:00:00' },
    { id: 13, activityType: 'view_report', description: 'Melihat laporan bulanan Februari 2024', page: '/reports', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T14:00:00' },
    { id: 14, activityType: 'update_settings', description: 'Mengubah pengaturan notifikasi', page: '/settings', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T15:00:00' },
    { id: 15, activityType: 'logout', description: 'Logout dari sistem', page: '/logout', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-10T17:00:00' },
    { id: 16, activityType: 'login', description: 'Login ke sistem', page: '/login', ipAddress: '192.168.1.100', userAgent: 'Chrome/120.0 Windows', timestamp: '2024-03-11T08:00:00' },
];

export default function PICActivities() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [activities] = useState(mockActivities);

    // Sort by timestamp descending
    const sortedActivities = [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Stats
    const stats = {
        total: activities.length,
        pages: [...new Set(activities.map(a => a.page))].length,
        approvals: activities.filter(a => a.activityType === 'approve_survey').length,
        rejections: activities.filter(a => a.activityType === 'reject_survey').length,
    };

    const ActivityBadge = ({ type }) => {
        const config = activityTypes[type];
        if (!config) return null;
        
        const Icon = config.icon;
        const colorClasses = {
            blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700',
            gray: isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700',
            cyan: isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-700',
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
            purple: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700',
            teal: isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-50 text-teal-700',
            indigo: isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-700',
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${colorClasses[config.color]}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const columns = [
        {
            key: 'timestamp',
            label: 'Waktu',
            render: (value) => {
                const date = new Date(value);
                return (
                    <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                            {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'activityType',
            label: 'Aktivitas',
            render: (value) => <ActivityBadge type={value} />
        },
        {
            key: 'description',
            label: 'Deskripsi',
            render: (value) => (
                <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value}</span>
            )
        },
        {
            key: 'page',
            label: 'Halaman',
            render: (value) => (
                <span className={`text-sm font-mono px-2 py-0.5 rounded ${isDark ? 'bg-emerald-950/50 text-emerald-400' : 'bg-gray-100 text-gray-700'}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'ipAddress',
            label: 'IP / Browser',
            render: (value, row) => (
                <div>
                    <div className={`text-sm font-mono ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value}</div>
                    <div className={`text-xs truncate max-w-[150px] ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.userAgent}</div>
                </div>
            )
        },
    ];

    const filters = [
        {
            key: 'activityType',
            label: 'Jenis Aktivitas',
            options: Object.entries(activityTypes).map(([key, val]) => ({ value: key, label: val.label }))
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Aktivitas PIC
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        Log aktivitas pengguna web Surveyor Portal
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-teal-100'}`}>
                                <MousePointerClick className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.total}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Total Aktivitas</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                <FileText className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.pages}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Halaman Dikunjungi</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                <CheckCircle className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.approvals}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Persetujuan</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                <XCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.rejections}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Penolakan</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Table */}
                <DataTable
                    data={sortedActivities}
                    columns={columns}
                    filters={filters}
                    searchKeys={['description', 'page', 'ipAddress']}
                    searchPlaceholder="Cari aktivitas..."
                />
            </div>
        </DashboardLayout>
    );
}
