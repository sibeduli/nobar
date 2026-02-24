import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import DataTable from '@/Components/DataTable';
import Modal, { ConfirmModal } from '@/Components/Modal';
import Button from '@/Components/Button';
import { Link } from '@inertiajs/react';
import { 
    Users, 
    UserCheck, 
    UserX, 
    Clock, 
    Plus,
    Eye,
    Edit3,
    Trash2,
    MoreHorizontal,
    Phone,
    Mail,
    MapPin,
    CheckCircle,
    XCircle,
    Download
} from 'lucide-react';

// Mock data - will be replaced with server-side data
const mockAgents = [
    { id: 1, name: 'Ahmad Sudrajat', email: 'ahmad.sudrajat@email.com', phone: '08123456789', areas: ['Jakarta Selatan', 'Jakarta Pusat'], status: 'active', surveys: 45, joinDate: '2024-01-15' },
    { id: 2, name: 'Budi Santoso', email: 'budi.santoso@email.com', phone: '08234567890', areas: ['Jakarta Barat'], status: 'active', surveys: 32, joinDate: '2024-02-20' },
    { id: 3, name: 'Citra Dewi', email: 'citra.dewi@email.com', phone: '08345678901', areas: ['Jakarta Timur', 'Bekasi'], status: 'inactive', surveys: 28, joinDate: '2024-01-08' },
    { id: 4, name: 'Dedi Kurniawan', email: 'dedi.k@email.com', phone: '08456789012', areas: ['Jakarta Pusat'], status: 'active', surveys: 51, joinDate: '2023-11-10' },
    { id: 5, name: 'Eka Putri', email: 'eka.putri@email.com', phone: '08567890123', areas: ['Jakarta Utara'], status: 'pending', surveys: 0, joinDate: '2024-03-01' },
    { id: 6, name: 'Fajar Ramadhan', email: 'fajar.r@email.com', phone: '08678901234', areas: ['Tangerang', 'Jakarta Barat', 'Depok'], status: 'active', surveys: 67, joinDate: '2023-09-15' },
    { id: 7, name: 'Gita Nuraini', email: 'gita.n@email.com', phone: '08789012345', areas: ['Bekasi'], status: 'active', surveys: 23, joinDate: '2024-02-01' },
    { id: 8, name: 'Hendra Wijaya', email: 'hendra.w@email.com', phone: '08890123456', areas: ['Depok', 'Bogor'], status: 'inactive', surveys: 15, joinDate: '2023-12-20' },
    { id: 9, name: 'Indah Permata', email: 'indah.p@email.com', phone: '08901234567', areas: ['Bogor'], status: 'active', surveys: 38, joinDate: '2024-01-25' },
    { id: 10, name: 'Joko Susilo', email: 'joko.s@email.com', phone: '08012345678', areas: ['Jakarta Selatan'], status: 'active', surveys: 42, joinDate: '2023-10-05' },
    { id: 11, name: 'Kartika Sari', email: 'kartika.s@email.com', phone: '08123456780', areas: ['Jakarta Barat', 'Tangerang'], status: 'pending', surveys: 0, joinDate: '2024-03-05' },
    { id: 12, name: 'Lukman Hakim', email: 'lukman.h@email.com', phone: '08234567891', areas: ['Jakarta Timur'], status: 'active', surveys: 29, joinDate: '2024-01-18' },
];

const statusConfig = {
    active: { label: 'Aktif', color: 'emerald' },
    inactive: { label: 'Nonaktif', color: 'red' },
    pending: { label: 'Pending', color: 'amber' },
};

export default function AgentsIndex() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';

    const [agents] = useState(mockAgents);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [activeTab, setActiveTab] = useState('all');

    // Summary stats
    const stats = {
        total: agents.length,
        active: agents.filter(a => a.status === 'active').length,
        inactive: agents.filter(a => a.status === 'inactive').length,
        pending: agents.filter(a => a.status === 'pending').length,
    };

    // Filter by tab
    const filteredAgents = activeTab === 'all' 
        ? agents 
        : agents.filter(a => a.status === activeTab);

    const handleDelete = (agent) => {
        setSelectedAgent(agent);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        toast.success(`Agen ${selectedAgent.name} berhasil dihapus`);
        setSelectedAgent(null);
    };

    const handleViewDetail = (agent) => {
        setSelectedAgent(agent);
        setShowDetailModal(true);
    };

    const handleBulkActivate = (selected) => {
        toast.success(`${selected.length} agen berhasil diaktifkan`);
    };

    const handleBulkDeactivate = (selected) => {
        toast.success(`${selected.length} agen berhasil dinonaktifkan`);
    };

    const handleBulkDelete = (selected) => {
        setSelectedAgents(selected);
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        toast.success(`${selectedAgents.length} agen berhasil dihapus`);
        setSelectedAgents([]);
    };

    const handleExport = (selected) => {
        toast.info(`Mengekspor ${selected.length} data agen...`);
    };

    const bulkActions = [
        { label: 'Aktifkan', icon: CheckCircle, onClick: handleBulkActivate },
        { label: 'Nonaktifkan', icon: XCircle, onClick: handleBulkDeactivate },
        { label: 'Export CSV', icon: Download, onClick: handleExport },
        { label: 'Hapus', icon: Trash2, onClick: handleBulkDelete, variant: 'danger' },
    ];

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status];
        const colors = {
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 'bg-emerald-50 text-emerald-700',
            red: isDark ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' : 'bg-red-50 text-red-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' : 'bg-amber-50 text-amber-700',
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${colors[config.color]}`}>
                {config.label}
            </span>
        );
    };

    const columns = [
        { 
            key: 'name', 
            label: 'Nama',
            render: (value, row) => (
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'}
                    `}>
                        {value.charAt(0)}
                    </div>
                    <div>
                        <div className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value}</div>
                        <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.email}</div>
                    </div>
                </div>
            )
        },
        { key: 'phone', label: 'Telepon' },
        { 
            key: 'areas', 
            label: 'Area',
            render: (value) => (
                <div className="flex flex-wrap gap-1">
                    {value.map((area, idx) => (
                        <span
                            key={idx}
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md
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
            )
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (value) => <StatusBadge status={value} />
        },
        { 
            key: 'surveys', 
            label: 'Survei',
            render: (value) => (
                <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>{value}</span>
            )
        },
        { 
            key: 'joinDate', 
            label: 'Bergabung',
            render: (value) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleViewDetail(row)}
                        className={`p-1.5 rounded-lg transition-colors
                            ${isDark ? 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                        `}
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <Link
                        href={`/agents/${row.id}/edit`}
                        className={`p-1.5 rounded-lg transition-colors
                            ${isDark ? 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                        `}
                        title="Edit"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(row)}
                        className={`p-1.5 rounded-lg transition-colors
                            ${isDark ? 'text-red-500/60 hover:text-red-400 hover:bg-red-500/10' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}
                        `}
                        title="Hapus"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ];

    const filters = [
        {
            key: 'area',
            label: 'Area',
            options: [
                { value: 'Jakarta Selatan', label: 'Jakarta Selatan' },
                { value: 'Jakarta Barat', label: 'Jakarta Barat' },
                { value: 'Jakarta Timur', label: 'Jakarta Timur' },
                { value: 'Jakarta Pusat', label: 'Jakarta Pusat' },
                { value: 'Jakarta Utara', label: 'Jakarta Utara' },
                { value: 'Tangerang', label: 'Tangerang' },
                { value: 'Bekasi', label: 'Bekasi' },
                { value: 'Depok', label: 'Depok' },
                { value: 'Bogor', label: 'Bogor' },
            ]
        }
    ];

    const SummaryCard = ({ title, value, icon: Icon, color }) => {
        const colorClasses = {
            emerald: isDark ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-600',
            blue: isDark ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' : 'bg-blue-50 text-blue-600',
            red: isDark ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : 'bg-red-50 text-red-600',
            amber: isDark ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : 'bg-amber-50 text-amber-600',
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

    const tabs = [
        { key: 'all', label: 'Semua', count: stats.total },
        { key: 'active', label: 'Aktif', count: stats.active },
        { key: 'inactive', label: 'Nonaktif', count: stats.inactive },
        { key: 'pending', label: 'Pending', count: stats.pending },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Agen Survey
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Kelola agen lapangan perusahaan Anda
                        </p>
                    </div>
                    <Link href="/agents/create">
                        <Button>
                            <Plus className="w-4 h-4" />
                            Tambah Agen
                        </Button>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard title="Total Agen" value={stats.total} icon={Users} color="blue" />
                    <SummaryCard title="Agen Aktif" value={stats.active} icon={UserCheck} color="emerald" />
                    <SummaryCard title="Agen Nonaktif" value={stats.inactive} icon={UserX} color="red" />
                    <SummaryCard title="Pending" value={stats.pending} icon={Clock} color="amber" />
                </div>

                {/* Tabs */}
                <div className={`inline-flex rounded-lg p-1 ${isDark ? 'bg-emerald-950/30' : 'bg-gray-100'}`}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                                ${activeTab === tab.key
                                    ? isDark 
                                        ? 'bg-emerald-500/20 text-emerald-400' 
                                        : 'bg-white text-gray-900 shadow-sm'
                                    : isDark 
                                        ? 'text-emerald-100/60 hover:text-emerald-100' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }
                            `}
                        >
                            {tab.label}
                            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full
                                ${activeTab === tab.key
                                    ? isDark ? 'bg-emerald-500/30' : 'bg-gray-200'
                                    : isDark ? 'bg-emerald-900/30' : 'bg-gray-200'
                                }
                            `}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Data Table */}
                <DataTable
                    data={filteredAgents}
                    columns={columns}
                    filters={filters}
                    searchPlaceholder="Cari nama, email, atau area..."
                    selectable
                    bulkActions={bulkActions}
                    onSelectionChange={(selected) => console.log('Selected:', selected)}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Agen?"
                message={`Apakah Anda yakin ingin menghapus agen "${selectedAgent?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                variant="danger"
            />

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={confirmBulkDelete}
                title="Hapus Agen Terpilih?"
                message={`Apakah Anda yakin ingin menghapus ${selectedAgents.length} agen? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus Semua"
                cancelText="Batal"
                variant="danger"
            />

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Agen"
                size="md"
            >
                {selectedAgent && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                                ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'}
                            `}>
                                {selectedAgent.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                    {selectedAgent.name}
                                </h3>
                                <StatusBadge status={selectedAgent.status} />
                            </div>
                        </div>

                        <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <Mail className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedAgent.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedAgent.phone}</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className={`w-4 h-4 mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <div className="flex flex-wrap gap-1">
                                    {selectedAgent.areas?.map((area, idx) => (
                                        <span
                                            key={idx}
                                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md
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
                        </div>

                        <div className={`grid grid-cols-2 gap-4 pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Total Survei</p>
                                <p className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>{selectedAgent.surveys}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Bergabung</p>
                                <p className={`text-sm font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                    {new Date(selectedAgent.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </Button>
                            <Link href={`/agents/${selectedAgent.id}/edit`}>
                                <Button>
                                    <Edit3 className="w-4 h-4" />
                                    Edit Agen
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}
