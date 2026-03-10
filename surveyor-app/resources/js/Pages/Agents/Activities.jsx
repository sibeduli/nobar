import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import SearchableSelect from '@/Components/SearchableSelect';
import { router } from '@inertiajs/react';
import { 
    Activity,
    Clock,
    MapPin,
    FileText,
    CheckCircle,
    LogIn,
    LogOut,
    Eye,
    Download,
    RefreshCw
} from 'lucide-react';

const activityTypeConfig = {
    survey: { label: 'Survei', icon: MapPin, color: 'emerald' },
    login: { label: 'Login', icon: LogIn, color: 'blue' },
    logout: { label: 'Logout', icon: LogOut, color: 'purple' },
};

const surveyStatusConfig = {
    approved: { label: 'Disetujui', color: 'emerald' },
    pending: { label: 'Pending', color: 'amber' },
    rejected: { label: 'Ditolak', color: 'red' },
};

export default function AgentActivities({ activities: initialActivities = [], agents: agentsList = [], stats: initialStats = {} }) {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';

    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter by agent
    const filteredActivities = !selectedAgent
        ? initialActivities
        : initialActivities.filter(a => a.agentId === selectedAgent);

    // Stats (recalculate based on filter)
    const stats = !selectedAgent ? initialStats : {
        total: filteredActivities.length,
        surveys: filteredActivities.filter(a => a.type === 'survey').length,
        completed: filteredActivities.filter(a => a.status === 'completed').length,
        pending: filteredActivities.filter(a => a.status === 'pending').length,
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.visit('/agents/activities', {
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false),
        });
    };

    const handleViewDetail = (activity) => {
        setSelectedActivity(activity);
        setShowDetailModal(true);
    };

    const handleExport = (selected) => {
        toast.info(`Mengekspor ${selected.length} data aktivitas...`);
    };

    const bulkActions = [
        { label: 'Export CSV', icon: Download, onClick: handleExport },
    ];

    const TypeBadge = ({ type }) => {
        const config = activityTypeConfig[type];
        const Icon = config.icon;
        const colors = {
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700',
            purple: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700',
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${colors[config.color]}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const SurveyStatusBadge = ({ status }) => {
        if (!status) return <span className={`text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>-</span>;
        const config = surveyStatusConfig[status];
        if (!config) return <span className={`text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>-</span>;
        const colors = {
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 'bg-emerald-50 text-emerald-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' : 'bg-amber-50 text-amber-700',
            red: isDark ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' : 'bg-red-50 text-red-700',
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${colors[config.color]}`}>
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
                        <div className={`text-sm ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'agentName',
            label: 'Agen',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                        ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'}
                    `}>
                        {value.charAt(0)}
                    </div>
                    <span className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value}</span>
                </div>
            )
        },
        {
            key: 'type',
            label: 'Tipe',
            render: (value) => <TypeBadge type={value} />
        },
        {
            key: 'description',
            label: 'Deskripsi',
            render: (value, row) => (
                <div>
                    <div className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{value}</div>
                    {row.location !== '-' && (
                        <div className={`text-xs flex items-center gap-1 mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[200px]">{row.location}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'ipAddress',
            label: 'IP Address',
            render: (value) => (
                <span className={`text-xs font-mono ${isDark ? 'text-emerald-400/70' : 'text-gray-600'}`}>
                    {value || '-'}
                </span>
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
            key: 'type',
            label: 'Tipe',
            options: [
                { value: 'survey', label: 'Survei' },
                { value: 'auth', label: 'Login/Logout' },
                { value: 'login', label: 'Login' },
                { value: 'logout', label: 'Logout' },
            ],
            customFilter: (item, filterValue) => {
                if (filterValue === 'auth') {
                    return item.type === 'login' || item.type === 'logout';
                }
                return item.type === filterValue;
            }
        }
    ];

    const SummaryCard = ({ title, value, icon: Icon, color }) => {
        const colorClasses = {
            emerald: isDark ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-600',
            blue: isDark ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' : 'bg-blue-50 text-blue-600',
            amber: isDark ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : 'bg-amber-50 text-amber-600',
            purple: isDark ? 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20' : 'bg-purple-50 text-purple-600',
        };

        return (
            <div className={`rounded-xl p-5 transition-all
                ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}
            `}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>{title}</p>
                        <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Aktivitas Agen
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Log aktivitas agen lapangan
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDark ? 'bg-emerald-950/50 text-emerald-400 hover:bg-emerald-900/50' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Perbarui
                        </button>
                        <div className="w-64">
                            <SearchableSelect
                                options={agentsList}
                                value={selectedAgent}
                                onChange={setSelectedAgent}
                                placeholder="Semua Agen"
                                searchPlaceholder="Cari nama agen..."
                            />
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard title="Total Aktivitas" value={stats.total || 0} icon={Activity} color="blue" />
                    <SummaryCard title="Total Survei" value={stats.surveys || 0} icon={MapPin} color="emerald" />
                    <SummaryCard title="Login" value={stats.logins || 0} icon={LogIn} color="purple" />
                    <SummaryCard title="Logout" value={stats.logouts || 0} icon={LogOut} color="amber" />
                </div>

                {/* Data Table */}
                <DataTable
                    data={filteredActivities}
                    columns={columns}
                    filters={filters}
                    searchPlaceholder="Cari aktivitas, agen, atau lokasi..."
                    selectable
                    bulkActions={bulkActions}
                    onSelectionChange={(selected) => console.log('Selected:', selected)}
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
                            <TypeBadge type={selectedActivity.type} />
                            {selectedActivity.surveyStatus && <SurveyStatusBadge status={selectedActivity.surveyStatus} />}
                        </div>

                        <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                            <h3 className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                {selectedActivity.description}
                            </h3>
                        </div>

                        <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                    ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'}
                                `}>
                                    {selectedActivity.agentName.charAt(0)}
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Agen</p>
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                        {selectedActivity.agentName}
                                    </p>
                                </div>
                            </div>

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

                            {selectedActivity.location !== '-' && (
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                        ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}
                                    `}>
                                        <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Lokasi</p>
                                        <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                            {selectedActivity.location}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {selectedActivity.ipAddress && selectedActivity.ipAddress !== '-' && (
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
                            )}

                            {selectedActivity.surveyId && (
                                <div className="pt-3">
                                    <a
                                        href={`/surveys?openSurvey=${selectedActivity.surveyId}`}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                            ${isDark ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-teal-100 text-teal-700 hover:bg-teal-200'}
                                        `}
                                    >
                                        <Eye className="w-4 h-4" />
                                        Lihat Data Survei
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
