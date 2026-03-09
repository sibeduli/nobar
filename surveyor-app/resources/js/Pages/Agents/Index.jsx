import { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import DataTable from '@/Components/DataTable';
import Modal, { ConfirmModal } from '@/Components/Modal';
import Button from '@/Components/Button';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    Users, 
    UserCheck, 
    UserX, 
    ClipboardList, 
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
    Download,
    Key,
    LogOut,
    Lock,
    EyeOff,
    Copy,
    QrCode,
    Link2,
    CreditCard,
    Home
} from 'lucide-react';

const statusConfig = {
    active: { label: 'Aktif', color: 'emerald' },
    inactive: { label: 'Nonaktif', color: 'red' },
};

export default function AgentsIndex({ agents: initialAgents = [], stats: initialStats = {} }) {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';
    const { flash } = usePage().props;

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const agents = initialAgents;
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showLoginLinkModal, setShowLoginLinkModal] = useState(false);

    // MOCK: Get agent login URL - will use actual domain in production
    const getAgentLoginUrl = () => {
        return `${window.location.origin}/agent/login`;
    };

    // MOCK: Copy login link to clipboard
    const copyLoginLink = async () => {
        try {
            await navigator.clipboard.writeText(getAgentLoginUrl());
            toast.success('Link login agen berhasil disalin');
        } catch (err) {
            toast.error('Gagal menyalin link');
        }
    };

    // MOCK: Download QR using external API - will use local QR generation in production
    const downloadQRCode = () => {
        const url = getAgentLoginUrl();
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
        
        const link = document.createElement('a');
        link.href = qrApiUrl;
        link.download = 'agent-login-qr.png';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code sedang diunduh');
    };

    // Use stats from props
    const stats = {
        total: initialStats.total || 0,
        active: initialStats.active || 0,
        inactive: initialStats.inactive || 0,
        totalSurveys: initialStats.totalSurveys || 0,
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
        router.delete(`/agents/${selectedAgent.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedAgent(null);
            },
            onError: () => {
                toast.error('Gagal menghapus agen');
            },
        });
    };

    const handleViewDetail = (agent) => {
        setSelectedAgent(agent);
        setShowDetailModal(true);
    };

    const handleBulkActivate = (selected) => {
        const ids = selected.map(agent => agent.id);
        router.post('/agents/bulk-status', { ids, status: 'active' }, {
            preserveScroll: true,
            onError: () => toast.error('Gagal mengaktifkan agen'),
        });
    };

    const handleBulkDeactivate = (selected) => {
        const ids = selected.map(agent => agent.id);
        router.post('/agents/bulk-status', { ids, status: 'inactive' }, {
            preserveScroll: true,
            onError: () => toast.error('Gagal menonaktifkan agen'),
        });
    };

    const handleBulkDelete = (selected) => {
        setSelectedAgents(selected);
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        const ids = selectedAgents.map(agent => agent.id);
        router.post('/agents/bulk-delete', { ids }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowBulkDeleteModal(false);
                setSelectedAgents([]);
            },
            onError: () => toast.error('Gagal menghapus agen'),
        });
    };

    const handleExport = (selected) => {
        const ids = selected.map(agent => agent.id);
        const params = new URLSearchParams();
        ids.forEach(id => params.append('ids[]', id));
        window.location.href = `/agents/export?${params.toString()}`;
        toast.success('Mengunduh data agen...');
    };

    const handleResetPassword = (agent) => {
        setSelectedAgent(agent);
        setNewPassword('');
        setShowNewPassword(false);
        setShowResetPasswordModal(true);
    };

    const confirmResetPassword = () => {
        if (newPassword.length < 6) {
            toast.error('Password minimal 6 karakter');
            return;
        }
        router.put(`/agents/${selectedAgent.id}/reset-password`, { password: newPassword }, {
            onSuccess: () => {
                setShowResetPasswordModal(false);
                setSelectedAgent(null);
                setNewPassword('');
            },
            onError: () => {
                toast.error('Gagal mereset password');
            },
        });
    };

    const handleForceLogout = (agent) => {
        setSelectedAgent(agent);
        setShowForceLogoutModal(true);
    };

    const confirmForceLogout = () => {
        router.post(`/agents/${selectedAgent.id}/force-logout`, {}, {
            onSuccess: () => {
                setShowForceLogoutModal(false);
                setSelectedAgent(null);
            },
            onError: () => {
                toast.error('Gagal logout agen');
            },
        });
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
                    <button
                        onClick={() => handleResetPassword(row)}
                        className={`p-1.5 rounded-lg transition-colors
                            ${isDark ? 'text-amber-500/60 hover:text-amber-400 hover:bg-amber-500/10' : 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'}
                        `}
                        title="Reset Password"
                    >
                        <Key className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleForceLogout(row)}
                        className={`p-1.5 rounded-lg transition-colors
                            ${isDark ? 'text-blue-500/60 hover:text-blue-400 hover:bg-blue-500/10' : 'text-blue-500 hover:text-blue-600 hover:bg-blue-50'}
                        `}
                        title="Paksa Logout Agen"
                    >
                        <LogOut className="w-4 h-4" />
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
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => setShowLoginLinkModal(true)}>
                            <Link2 className="w-4 h-4" />
                            Link Login Agen
                        </Button>
                        <Link href="/agents/create">
                            <Button>
                                <Plus className="w-4 h-4" />
                                Tambah Agen
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard title="Total Agen" value={stats.total} icon={Users} color="blue" />
                    <SummaryCard title="Agen Aktif" value={stats.active} icon={UserCheck} color="emerald" />
                    <SummaryCard title="Agen Nonaktif" value={stats.inactive} icon={UserX} color="red" />
                    <SummaryCard title="Total Survei" value={stats.totalSurveys} icon={ClipboardList} color="amber" />
                </div>

                {/* Tabs */}
                <div className="overflow-x-auto -mx-6 px-6">
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
                size="lg"
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
                                <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedAgent.email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedAgent.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CreditCard className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>NIK: {selectedAgent.nik || '-'}</span>
                            </div>
                            {selectedAgent.address && (
                                <div className="flex items-start gap-3">
                                    <Home className={`w-4 h-4 mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                    <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedAgent.address}</span>
                                </div>
                            )}
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

                        {/* KTP Photo */}
                        {selectedAgent.ktp_photo && (
                            <div className={`pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Foto KTP</p>
                                <img 
                                    src={selectedAgent.ktp_photo} 
                                    alt="KTP" 
                                    className="w-full max-w-sm rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                    onClick={() => window.open(selectedAgent.ktp_photo, '_blank')}
                                />
                            </div>
                        )}

                        {/* Notes */}
                        {selectedAgent.notes && (
                            <div className={`pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Catatan</p>
                                <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedAgent.notes}</p>
                            </div>
                        )}

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

            {/* Reset Password Modal */}
            <Modal
                isOpen={showResetPasswordModal}
                onClose={() => setShowResetPasswordModal(false)}
                title="Reset Password Agen"
            >
                {selectedAgent && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                            <div className="flex items-center gap-3">
                                <Key className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                <div>
                                    <p className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                        Reset password untuk {selectedAgent.name}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-amber-400/70' : 'text-amber-600'}`}>
                                        Login: {selectedAgent.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                Password Baru <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    className={`w-full px-4 py-2.5 pr-10 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2
                                        ${isDark 
                                            ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                            : 'bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                                        }
                                    `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={() => setShowResetPasswordModal(false)}>
                                Batal
                            </Button>
                            <Button onClick={confirmResetPassword}>
                                <Key className="w-4 h-4" />
                                Reset Password
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Force Logout Modal */}
            <ConfirmModal
                isOpen={showForceLogoutModal}
                onClose={() => setShowForceLogoutModal(false)}
                onConfirm={confirmForceLogout}
                title="Force Logout Agen?"
                message={selectedAgent ? `Semua sesi aktif ${selectedAgent.name} akan dilogout. Agen harus login ulang untuk mengakses aplikasi.` : ''}
                confirmText="Ya, Logout Semua"
                cancelText="Batal"
                variant="warning"
            />

            {/* Login Link Modal */}
            <Modal
                isOpen={showLoginLinkModal}
                onClose={() => setShowLoginLinkModal(false)}
                title="Link Login Agen"
            >
                <div className="space-y-6">
                    <p className={`text-sm ${isDark ? 'text-emerald-500/70' : 'text-gray-600'}`}>
                        Bagikan link atau QR code ini kepada agen untuk login ke aplikasi mobile.
                    </p>

                    {/* QR Code */}
                    <div className="flex justify-center">
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-white' : 'bg-gray-50'}`}>
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getAgentLoginUrl())}`}
                                alt="QR Code Login Agen"
                                className="w-48 h-48"
                            />
                        </div>
                    </div>

                    {/* URL Display */}
                    <div className={`p-3 rounded-lg flex items-center gap-3 ${isDark ? 'bg-emerald-950/30 border border-emerald-900/50' : 'bg-gray-100 border border-gray-200'}`}>
                        <Link2 className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                        <span className={`text-sm flex-1 truncate ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                            {getAgentLoginUrl()}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button variant="secondary" className="flex-1" onClick={copyLoginLink}>
                            <Copy className="w-4 h-4" />
                            Salin Link
                        </Button>
                        <Button className="flex-1" onClick={downloadQRCode}>
                            <Download className="w-4 h-4" />
                            Unduh QR
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
