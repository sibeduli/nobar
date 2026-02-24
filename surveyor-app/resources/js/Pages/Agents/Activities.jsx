import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import SearchableSelect from '@/Components/SearchableSelect';
import { 
    Activity,
    Clock,
    MapPin,
    FileText,
    Camera,
    CheckCircle,
    AlertCircle,
    Eye,
    Download,
    Trash2
} from 'lucide-react';

// Mock agents for filter
const agentsList = [
    { value: '1', label: 'Ahmad Sudrajat' },
    { value: '2', label: 'Budi Santoso' },
    { value: '3', label: 'Citra Dewi' },
    { value: '4', label: 'Dedi Kurniawan' },
    { value: '5', label: 'Eka Putri' },
    { value: '6', label: 'Fajar Ramadhan' },
    { value: '7', label: 'Gita Nuraini' },
    { value: '8', label: 'Hendra Wijaya' },
];

// Mock activity data
const mockActivities = [
    { id: 1, agentId: '1', agentName: 'Ahmad Sudrajat', type: 'survey', description: 'Survei lokasi Warung Makan Sederhana', location: 'Jl. Sudirman No. 45, Jakarta Selatan', timestamp: '2024-03-10 14:30', status: 'completed', hasPhoto: true },
    { id: 2, agentId: '2', agentName: 'Budi Santoso', type: 'survey', description: 'Survei lokasi Cafe Kopi Nusantara', location: 'Jl. Gatot Subroto No. 12, Jakarta Barat', timestamp: '2024-03-10 13:45', status: 'completed', hasPhoto: true },
    { id: 3, agentId: '1', agentName: 'Ahmad Sudrajat', type: 'checkin', description: 'Check-in lokasi kerja', location: 'Kantor Pusat TVRI', timestamp: '2024-03-10 08:00', status: 'completed', hasPhoto: false },
    { id: 4, agentId: '3', agentName: 'Citra Dewi', type: 'survey', description: 'Survei lokasi Restoran Padang Jaya', location: 'Jl. Pemuda No. 78, Jakarta Timur', timestamp: '2024-03-10 11:20', status: 'pending', hasPhoto: true },
    { id: 5, agentId: '4', agentName: 'Dedi Kurniawan', type: 'report', description: 'Laporan harian survei', location: '-', timestamp: '2024-03-10 17:00', status: 'completed', hasPhoto: false },
    { id: 6, agentId: '2', agentName: 'Budi Santoso', type: 'checkout', description: 'Check-out lokasi kerja', location: 'Kantor Pusat TVRI', timestamp: '2024-03-09 17:30', status: 'completed', hasPhoto: false },
    { id: 7, agentId: '5', agentName: 'Eka Putri', type: 'survey', description: 'Survei lokasi Toko Elektronik Jaya', location: 'Jl. Mangga Dua No. 100, Jakarta Utara', timestamp: '2024-03-09 15:00', status: 'failed', hasPhoto: false },
    { id: 8, agentId: '6', agentName: 'Fajar Ramadhan', type: 'survey', description: 'Survei lokasi Bengkel Motor Abadi', location: 'Jl. Raya Serpong No. 55, Tangerang', timestamp: '2024-03-09 10:30', status: 'completed', hasPhoto: true },
    { id: 9, agentId: '7', agentName: 'Gita Nuraini', type: 'checkin', description: 'Check-in lokasi kerja', location: 'Kantor Cabang Bekasi', timestamp: '2024-03-09 08:15', status: 'completed', hasPhoto: false },
    { id: 10, agentId: '8', agentName: 'Hendra Wijaya', type: 'survey', description: 'Survei lokasi Apotek Sehat', location: 'Jl. Margonda Raya No. 200, Depok', timestamp: '2024-03-08 14:00', status: 'completed', hasPhoto: true },
    { id: 11, agentId: '1', agentName: 'Ahmad Sudrajat', type: 'report', description: 'Laporan mingguan survei', location: '-', timestamp: '2024-03-08 16:30', status: 'completed', hasPhoto: false },
    { id: 12, agentId: '4', agentName: 'Dedi Kurniawan', type: 'survey', description: 'Survei lokasi Salon Cantik', location: 'Jl. Thamrin No. 30, Jakarta Pusat', timestamp: '2024-03-08 11:00', status: 'completed', hasPhoto: true },
];

const activityTypeConfig = {
    survey: { label: 'Survei', icon: MapPin, color: 'emerald' },
    checkin: { label: 'Check-in', icon: Clock, color: 'blue' },
    checkout: { label: 'Check-out', icon: Clock, color: 'purple' },
    report: { label: 'Laporan', icon: FileText, color: 'amber' },
};

const statusConfig = {
    completed: { label: 'Selesai', color: 'emerald' },
    pending: { label: 'Pending', color: 'amber' },
    failed: { label: 'Gagal', color: 'red' },
};

export default function AgentActivities() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';

    const [activities] = useState(mockActivities);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState('');

    // Filter by agent
    const filteredActivities = !selectedAgent
        ? activities
        : activities.filter(a => a.agentId === selectedAgent);

    // Stats
    const stats = {
        total: filteredActivities.length,
        surveys: filteredActivities.filter(a => a.type === 'survey').length,
        completed: filteredActivities.filter(a => a.status === 'completed').length,
        pending: filteredActivities.filter(a => a.status === 'pending').length,
    };

    const handleViewDetail = (activity) => {
        setSelectedActivity(activity);
        setShowDetailModal(true);
    };

    const handleExport = (selected) => {
        toast.info(`Mengekspor ${selected.length} data aktivitas...`);
    };

    const handleDelete = (selected) => {
        toast.success(`${selected.length} aktivitas berhasil dihapus`);
    };

    const bulkActions = [
        { label: 'Export CSV', icon: Download, onClick: handleExport },
        { label: 'Hapus', icon: Trash2, onClick: handleDelete, variant: 'danger' },
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

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status];
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
            key: 'hasPhoto',
            label: 'Foto',
            render: (value) => value ? (
                <Camera className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
            ) : (
                <span className={`text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>-</span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => <StatusBadge status={value} />
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
                { value: 'checkin', label: 'Check-in' },
                { value: 'checkout', label: 'Check-out' },
                { value: 'report', label: 'Laporan' },
            ]
        },
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'completed', label: 'Selesai' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Gagal' },
            ]
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

                    {/* Agent Filter */}
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

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard title="Total Aktivitas" value={stats.total} icon={Activity} color="blue" />
                    <SummaryCard title="Total Survei" value={stats.surveys} icon={MapPin} color="emerald" />
                    <SummaryCard title="Selesai" value={stats.completed} icon={CheckCircle} color="purple" />
                    <SummaryCard title="Pending" value={stats.pending} icon={AlertCircle} color="amber" />
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
                            <StatusBadge status={selectedActivity.status} />
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

                            {selectedActivity.hasPhoto && (
                                <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                        ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}
                                    `}>
                                        <Camera className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Foto</p>
                                        <div className={`mt-2 w-full h-32 rounded-lg flex items-center justify-center
                                            ${isDark ? 'bg-emerald-950/50' : 'bg-gray-200'}
                                        `}>
                                            <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                [Foto Aktivitas]
                                            </span>
                                        </div>
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
