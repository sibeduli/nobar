import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import { router } from '@inertiajs/react';
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
    RefreshCw,
    Clock,
} from 'lucide-react';

// Activity types with icons and colors
const activityTypes = {
    login: { label: 'Login', icon: LogIn, color: 'blue' },
    logout: { label: 'Logout', icon: LogOut, color: 'gray' },
    approve_survey: { label: 'Setujui Survey', icon: CheckCircle, color: 'emerald' },
    reject_survey: { label: 'Tolak Survey', icon: XCircle, color: 'red' },
    update_survey: { label: 'Update Survey', icon: Edit3, color: 'amber' },
    edit_survey: { label: 'Edit Survey', icon: Edit3, color: 'amber' },
    delete_survey: { label: 'Hapus Survey', icon: Trash2, color: 'red' },
    export_data: { label: 'Export Data', icon: Download, color: 'purple' },
    create_agent: { label: 'Tambah Agen', icon: Users, color: 'emerald' },
    edit_agent: { label: 'Edit Agen', icon: Edit3, color: 'amber' },
    delete_agent: { label: 'Hapus Agen', icon: Trash2, color: 'red' },
};

export default function PICActivities({ activities: initialActivities = [], stats: initialStats = {} }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const [activities] = useState(initialActivities);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    // Sort by timestamp descending
    const sortedActivities = [...activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['activities', 'stats'],
            onFinish: () => setIsRefreshing(false),
        });
    };

    const handleViewDetail = (activity) => {
        setSelectedActivity(activity);
        setShowDetailModal(true);
    };

    // Stats from backend
    const stats = initialStats;

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
                <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value || '-'}</span>
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
        {
            key: 'actions',
            label: '',
            sortable: false,
            render: (_, row) => (
                <button
                    onClick={() => handleViewDetail(row)}
                    className={`p-1.5 rounded-lg transition-colors
                        ${isDark ? 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                    `}
                    title="Lihat Detail"
                >
                    <Eye className="w-4 h-4" />
                </button>
            )
        },
    ];

    const filters = [
        {
            key: 'activityType',
            label: 'Jenis Aktivitas',
            options: [
                { value: 'auth', label: 'Login/Logout' },
                { value: 'login', label: 'Login' },
                { value: 'logout', label: 'Logout' },
                { value: 'survey', label: 'Aktivitas Survey' },
                { value: 'approve_survey', label: 'Setujui Survey' },
                { value: 'reject_survey', label: 'Tolak Survey' },
                { value: 'edit_survey', label: 'Edit Survey' },
                { value: 'delete_survey', label: 'Hapus Survey' },
                { value: 'agent', label: 'Aktivitas Agen' },
                { value: 'create_agent', label: 'Tambah Agen' },
                { value: 'edit_agent', label: 'Edit Agen' },
                { value: 'delete_agent', label: 'Hapus Agen' },
                { value: 'export_data', label: 'Export Data' },
            ],
            customFilter: (item, filterValue) => {
                if (filterValue === 'auth') {
                    return item.activityType === 'login' || item.activityType === 'logout';
                }
                if (filterValue === 'survey') {
                    return ['approve_survey', 'reject_survey', 'update_survey', 'edit_survey', 'delete_survey'].includes(item.activityType);
                }
                if (filterValue === 'agent') {
                    return ['create_agent', 'edit_agent', 'delete_agent'].includes(item.activityType);
                }
                return item.activityType === filterValue;
            }
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-teal-100'}`}>
                                <MousePointerClick className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.total || 0}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Total Aktivitas</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                <LogIn className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.logins || 0}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Login</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                <CheckCircle className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.approvals || 0}</p>
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
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.rejections || 0}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Penolakan</p>
                            </div>
                        </div>
                    </div>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                                <Edit3 className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{stats.edits || 0}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Edit Data</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refresh Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isDark 
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-50' 
                                : 'bg-teal-100 text-teal-700 hover:bg-teal-200 disabled:opacity-50'}
                        `}
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Perbarui
                    </button>
                </div>

                {/* Activity Table */}
                <DataTable
                    data={sortedActivities}
                    columns={columns}
                    filters={filters}
                    searchKeys={['description', 'ipAddress']}
                    searchPlaceholder="Cari aktivitas..."
                    onRowDoubleClick={handleViewDetail}
                />
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Aktivitas"
                size="md"
            >
                {selectedActivity && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <ActivityBadge type={selectedActivity.activityType} />
                        </div>

                        <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                            <h3 className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                {selectedActivity.description || '-'}
                            </h3>
                        </div>

                        <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                    ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}
                                `}>
                                    <Clock className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Waktu</p>
                                    <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                        {new Date(selectedActivity.timestamp).toLocaleString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                    ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}
                                `}>
                                    <FileText className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>IP Address</p>
                                    <p className={`text-sm font-mono ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                        {selectedActivity.ipAddress}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                    ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}
                                `}>
                                    <FileText className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Browser</p>
                                    <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                        {selectedActivity.userAgent}
                                    </p>
                                </div>
                            </div>

                            {selectedActivity.targetType && (
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                        ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}
                                    `}>
                                        <FileText className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Target</p>
                                        <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                            {selectedActivity.targetType} #{selectedActivity.targetId}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
