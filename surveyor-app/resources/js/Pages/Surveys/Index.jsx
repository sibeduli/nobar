import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import DataTable from '@/Components/DataTable';
import Modal, { ConfirmModal } from '@/Components/Modal';
import Button from '@/Components/Button';
import FormInput, { FormTextarea, FormSelect } from '@/Components/FormInput';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { 
    ClipboardList,
    MapPin,
    Calendar,
    User,
    Eye,
    Edit3,
    Trash2,
    Download,
    CheckCircle,
    XCircle,
    Clock,
    Camera,
    FileText,
    Store,
    AlertTriangle,
    Users,
    Briefcase,
    RefreshCw,
    Pencil,
    History,
} from 'lucide-react';

// Report type labels
const REPORT_TYPES = {
    verified: { label: 'Terverifikasi', color: 'emerald' },
    verified_non_commercial: { label: 'Terverifikasi (Non-Komersial)', color: 'emerald' },
    violation_invalid_qr: { label: 'QR Invalid', color: 'red' },
    violation_capacity: { label: 'Melebihi Kapasitas', color: 'red' },
    violation_ads: { label: 'Iklan Ilegal', color: 'red' },
    violation_no_license: { label: 'Tanpa Lisensi', color: 'red' },
    violation_venue: { label: 'Venue Tidak Sesuai', color: 'red' },
    lead: { label: 'Penawaran Lisensi', color: 'blue' },
    documentation: { label: 'Dokumentasi', color: 'blue' },
    other: { label: 'Lainnya', color: 'gray' },
};

const statusConfig = {
    approved: { label: 'Disetujui', color: 'emerald' },
    pending: { label: 'Pending', color: 'amber' },
    rejected: { label: 'Ditolak', color: 'red' },
    needs_review: { label: 'Perlu Review', color: 'blue' },
};

const categoryConfig = {
    commercial: { label: 'Komersial', color: 'amber' },
    non_commercial: { label: 'Non-Komersial', color: 'blue' },
};

export default function SurveysIndex({ surveys = [], stats = {}, violationStats = {}, leadStats = {} }) {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';
    const { flash } = usePage().props;

    // Get tab from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');

    // Use props directly instead of local state so data updates on Inertia reload
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [selectedSurveys, setSelectedSurveys] = useState([]);
    const [activeTab, setActiveTab] = useState(
        tabFromUrl === 'violations' ? 'violations' : 
        tabFromUrl === 'leads' ? 'leads' : 'all'
    );
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        venue_contact: '',
        venue_phone: '',
        category: '',
        capacity_limit: '',
        description: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isReverting, setIsReverting] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [showResolveConfirm, setShowResolveConfirm] = useState(false);
    const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);


    const handleRefresh = () => {
        setIsRefreshing(true);
        router.visit(window.location.pathname + window.location.search, {
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false),
        });
    };

    // Separate violations for the violations tab (filtered view)
    const violations = surveys.filter(s => s.is_violation);
    // Separate leads for the leads tab (filtered view)
    const leads = surveys.filter(s => s.report_type === 'lead');
    // All surveys shown in main tabs (including violations)
    const allSurveys = surveys;

    // Update URL and refresh data when tab changes
    const handleTabChange = (tab) => {
        const url = tab === 'violations' ? '/surveys?tab=violations' : 
                    tab === 'leads' ? '/surveys?tab=leads' : '/surveys';
        router.visit(url, { preserveScroll: true });
    };

    // Filter by tab (all surveys including violations)
    const filteredSurveys = activeTab === 'all' 
        ? allSurveys 
        : allSurveys.filter(s => s.status === activeTab);

    const handleViewDetail = (survey) => {
        setSelectedSurvey(survey);
        setShowDetailModal(true);
    };

    const handleDelete = (survey) => {
        setSelectedSurvey(survey);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedSurvey) return;
        router.delete(`/surveys/${selectedSurvey.id}`, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                toast.success('Survey berhasil dihapus');
                setShowDeleteModal(false);
                setSelectedSurvey(null);
            },
            onError: () => toast.error('Gagal menghapus survey'),
        });
    };

    const handleUpdateStatus = async (surveyId, status) => {
        setIsUpdating(true);
        router.put(`/surveys/${surveyId}/status`, { status }, {
            preserveScroll: true,
            preserveState: false, // Force refresh of page data
            onSuccess: () => {
                toast.success(`Status survey berhasil diperbarui`);
                setShowDetailModal(false);
                setSelectedSurvey(null);
            },
            onError: () => toast.error('Gagal memperbarui status'),
            onFinish: () => setIsUpdating(false),
        });
    };

    const handleOpenEdit = (survey) => {
        setSelectedSurvey(survey);
        setEditForm({
            venue_contact: survey.pic_venue_contact || survey.venue_contact || '',
            venue_phone: survey.pic_venue_phone || survey.venue_phone || '',
            category: survey.pic_category || survey.category || '',
            capacity_limit: survey.pic_capacity_limit || survey.capacity_limit || '',
            description: survey.pic_description || survey.description || '',
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        if (!selectedSurvey) return;
        
        const newCapacity = parseInt(editForm.capacity_limit) || selectedSurvey.capacity_limit || 0;
        const actualVisitors = selectedSurvey.actual_visitors || 0;

        // Handle capacity violations
        if (selectedSurvey.report_type === 'violation_capacity') {
            if (selectedSurvey.status === 'pending' && newCapacity >= actualVisitors) {
                // Pending -> Will resolve - show confirmation
                setShowResolveConfirm(true);
                return;
            }
            if (selectedSurvey.status === 'approved' && newCapacity < actualVisitors) {
                // Resolved -> Will reactivate - show confirmation
                setShowReactivateConfirm(true);
                return;
            }
            // No status change - just save
        }
        // For other violation types (pending), show resolve confirmation
        else if (selectedSurvey.is_violation && selectedSurvey.status === 'pending') {
            setShowResolveConfirm(true);
            return;
        }

        executeSaveEdit();
    };

    const executeSaveEdit = () => {
        if (!selectedSurvey) return;
        const surveyId = selectedSurvey.id;
        setIsEditing(true);
        setShowResolveConfirm(false);
        setShowReactivateConfirm(false);
        setShowEditModal(false);
        router.put(`/surveys/${surveyId}/pic-edit`, editForm, {
            preserveScroll: true,
            onSuccess: (page) => {
                // Find updated survey from fresh page data
                const updatedSurvey = page.props.surveys?.find(s => s.id === surveyId);
                if (updatedSurvey) {
                    setSelectedSurvey(updatedSurvey);
                    setShowDetailModal(true);
                }
            },
            onError: () => toast.error('Gagal memperbarui data survey'),
            onFinish: () => setIsEditing(false),
        });
    };

    const handleRevertPicEdit = () => {
        if (!selectedSurvey) return;

        // If this is a resolved capacity violation, check if original data still violates
        if (selectedSurvey.report_type === 'violation_capacity' && selectedSurvey.status === 'approved') {
            const originalCapacity = selectedSurvey.capacity_limit || 0;
            const actualVisitors = selectedSurvey.actual_visitors || 0;
            
            if (originalCapacity < actualVisitors) {
                // Will reactivate - show confirmation
                setShowReactivateConfirm(true);
                return;
            }
            // Won't reactivate - just revert without confirmation
        }
        // For other violation types, show confirmation
        else if (selectedSurvey.is_violation && selectedSurvey.status === 'approved') {
            setShowReactivateConfirm(true);
            return;
        }

        executeRevertPicEdit();
    };

    const executeRevertPicEdit = () => {
        if (!selectedSurvey) return;
        const surveyId = selectedSurvey.id;
        setIsReverting(true);
        setShowReactivateConfirm(false);
        setShowCompareModal(false);
        setShowDetailModal(false);
        router.delete(`/surveys/${surveyId}/pic-edit`, {
            preserveScroll: true,
            onSuccess: (page) => {
                // Find updated survey from fresh page data
                const updatedSurvey = page.props.surveys?.find(s => s.id === surveyId);
                if (updatedSurvey) {
                    setSelectedSurvey(updatedSurvey);
                    setShowDetailModal(true);
                }
            },
            onError: () => toast.error('Gagal mengembalikan ke versi agent'),
            onFinish: () => setIsReverting(false),
        });
    };

    const handleBulkApprove = (selected) => {
        const ids = selected.map(s => s.id);
        router.post('/surveys/bulk-status', { ids, status: 'approved' }, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => toast.success(`${selected.length} survey berhasil disetujui`),
            onError: () => toast.error('Gagal memperbarui status'),
        });
    };

    const handleBulkReject = (selected) => {
        const ids = selected.map(s => s.id);
        router.post('/surveys/bulk-status', { ids, status: 'rejected' }, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => toast.success(`${selected.length} survey berhasil ditolak`),
            onError: () => toast.error('Gagal memperbarui status'),
        });
    };

    const handleBulkDelete = (selected) => {
        setSelectedSurveys(selected);
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        const ids = selectedSurveys.map(s => s.id);
        router.post('/surveys/bulk-delete', { ids }, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                toast.success(`${selectedSurveys.length} survey berhasil dihapus`);
                setSelectedSurveys([]);
                setShowBulkDeleteModal(false);
            },
            onError: () => toast.error('Gagal menghapus survey'),
        });
    };

    const handleExport = () => {
        window.location.href = '/surveys/export';
    };

    const bulkActions = [
        { label: 'Setujui', icon: CheckCircle, onClick: handleBulkApprove },
        { label: 'Tolak', icon: XCircle, onClick: handleBulkReject },
        { label: 'Export CSV', icon: Download, onClick: handleExport },
        { label: 'Hapus', icon: Trash2, onClick: handleBulkDelete, variant: 'danger' },
    ];

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status] || statusConfig.pending;
        const colors = {
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 'bg-emerald-50 text-emerald-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30' : 'bg-amber-50 text-amber-700',
            red: isDark ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' : 'bg-red-50 text-red-700',
            blue: isDark ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' : 'bg-blue-50 text-blue-700',
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${colors[config.color]}`}>
                {config.label}
            </span>
        );
    };

    const ReportTypeBadge = ({ type }) => {
        const config = REPORT_TYPES[type] || REPORT_TYPES.other;
        const colors = {
            blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700',
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
            gray: isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-50 text-gray-700',
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${colors[config.color]}`}>
                {config.label}
            </span>
        );
    };

    const CategoryBadge = ({ category }) => {
        const config = categoryConfig[category] || categoryConfig.commercial;
        const colors = {
            amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700',
            blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700',
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${colors[config.color]}`}>
                {config.label}
            </span>
        );
    };

    const columns = [
        { 
            key: 'venue_name', 
            label: 'Venue',
            render: (value, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value || 'Unknown'}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                        <ReportTypeBadge type={row.report_type} />
                    </div>
                </div>
            )
        },
        { 
            key: 'venue_contact', 
            label: 'Contact',
            render: (value, row) => (
                <div>
                    <div className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value || '-'}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.venue_phone || '-'}</div>
                </div>
            )
        },
        { 
            key: 'venue_address', 
            label: 'Alamat',
            render: (value) => (
                <div className={`text-sm truncate max-w-[200px] ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                    {value || '-'}
                </div>
            )
        },
        { 
            key: 'category', 
            label: 'Kategori',
            render: (value) => <CategoryBadge category={value} />
        },
        { 
            key: 'agent_name', 
            label: 'Agent',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                        ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'}
                    `}>
                        {value?.charAt(0) || '?'}
                    </div>
                    <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value || 'Unknown'}</span>
                </div>
            )
        },
        { 
            key: 'created_at', 
            label: 'Tanggal',
            render: (value) => (
                <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                    {value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
            )
        },
        {
            key: 'photos',
            label: 'Foto',
            render: (value) => value && value.length > 0 ? (
                <div className="flex items-center gap-1">
                    <Camera className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                    <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{value.length}</span>
                </div>
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
            key: 'report_type',
            label: 'Tipe Laporan',
            options: [
                { value: 'verified', label: 'Terverifikasi' },
                { value: 'verified_non_commercial', label: 'Terverifikasi (Non-Komersial)' },
                { value: 'lead', label: 'Penawaran Lisensi' },
                { value: 'documentation', label: 'Dokumentasi' },
            ]
        },
        {
            key: 'category',
            label: 'Kategori',
            options: [
                { value: 'commercial', label: 'Komersial' },
                { value: 'non_commercial', label: 'Non-Komersial' },
            ]
        }
    ];

    const SummaryCard = ({ title, value, icon: Icon, color, active, onClick }) => {
        const colorClasses = {
            blue: isDark ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' : 'bg-blue-50 text-blue-600',
            emerald: isDark ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-600',
            amber: isDark ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : 'bg-amber-50 text-amber-600',
            red: isDark ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : 'bg-red-50 text-red-600',
        };

        return (
            <button
                onClick={onClick}
                className={`w-full rounded-xl p-5 text-left transition-all
                    ${active 
                        ? isDark 
                            ? 'bg-emerald-500/10 border-2 border-emerald-500/50 ring-2 ring-emerald-500/20' 
                            : 'bg-teal-50 border-2 border-teal-500'
                        : isDark 
                            ? 'bg-[#0d1414] border border-emerald-900/30 hover:border-emerald-500/30' 
                            : 'bg-white border border-gray-200 hover:border-teal-300'
                    }
                `}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`text-sm ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>{title}</p>
                        <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </button>
        );
    };

    // Violation columns - use report_type for badge
    const ViolationBadge = ({ type }) => {
        const config = REPORT_TYPES[type];
        if (!config) return null;
        const colors = {
            red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700',
            blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700',
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            gray: isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700',
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${colors[config.color]}`}>
                <AlertTriangle className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const ViolationStatusBadge = ({ status }) => {
        const config = {
            pending: { label: 'Terbuka', color: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700' },
            approved: { label: 'Selesai', color: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700' },
            rejected: { label: 'Ditolak', color: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700' },
        };
        const { label, color } = config[status] || config.pending;
        return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>
                {label}
            </span>
        );
    };

    const violationColumns = [
        {
            key: 'venue_name',
            label: 'Venue',
            render: (value, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value || 'Unknown'}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.venue_address || '-'}</div>
                </div>
            )
        },
        {
            key: 'report_type',
            label: 'Jenis Pelanggaran',
            render: (value) => <ViolationBadge type={value} />
        },
        {
            key: 'actual_visitors',
            label: 'Detail',
            render: (value, row) => (
                <div>
                    {row.report_type === 'violation_capacity' && value ? (
                        <>
                            <span className={`font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{value} orang</span>
                            {(row.effective_capacity || row.capacity_limit) && (
                                <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                    Kapasitas: {row.effective_capacity || row.capacity_limit} orang
                                </div>
                            )}
                        </>
                    ) : (
                        <span className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>-</span>
                    )}
                </div>
            )
        },
        {
            key: 'agent_name',
            label: 'Dilaporkan Oleh',
            render: (value, row) => (
                <div>
                    <div className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value || 'Unknown'}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => <ViolationStatusBadge status={value} />
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleViewDetail(row)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-emerald-500/10 text-emerald-400' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ];

    // Lead columns for Penawaran tab
    const leadColumns = [
        {
            key: 'venue_name',
            label: 'Venue',
            render: (value, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value || 'Unknown'}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.venue_address || '-'}</div>
                </div>
            )
        },
        {
            key: 'venue_contact',
            label: 'Kontak',
            render: (value, row) => (
                <div>
                    <div className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value || '-'}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.venue_phone || '-'}</div>
                </div>
            )
        },
        {
            key: 'agent_name',
            label: 'Dilaporkan Oleh',
            render: (value, row) => (
                <div>
                    <div className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value || 'Unknown'}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}
                    </div>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => <ViolationStatusBadge status={value} />
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleViewDetail(row)}
                        className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-emerald-500/10 text-emerald-500/60 hover:text-emerald-400' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
                        title="Lihat Detail"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Data Survey
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Kelola data hasil survey venue untuk lisensi Nobar Piala Dunia 2026
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-3">
                <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-emerald-950/50' : 'bg-gray-100'}`}>
                    <button
                        onClick={() => handleTabChange('all')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === 'all' || (!['violations', 'leads'].includes(activeTab) && !['violations', 'leads'].includes(activeTab))
                                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-teal-700 shadow-sm'
                                : isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-600 hover:text-gray-900'
                            }
                        `}
                    >
                        <FileText className="w-4 h-4" />
                        Semua Survey
                    </button>
                    <button
                        onClick={() => handleTabChange('violations')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === 'violations'
                                ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-white text-red-700 shadow-sm'
                                : isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-600 hover:text-gray-900'
                            }
                        `}
                    >
                        <AlertTriangle className="w-4 h-4" />
                        Pelanggaran
                        {violationStats.open > 0 && (
                            <span className={`px-1.5 py-0.5 text-xs rounded-full ${isDark ? 'bg-red-500 text-white' : 'bg-red-600 text-white'}`}>
                                {violationStats.open}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => handleTabChange('leads')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === 'leads'
                                ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-white text-blue-700 shadow-sm'
                                : isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-600 hover:text-gray-900'
                            }
                        `}
                    >
                        <Briefcase className="w-4 h-4" />
                        Penawaran
                        {leadStats.open > 0 && (
                            <span className={`px-1.5 py-0.5 text-xs rounded-full ${isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'}`}>
                                {leadStats.open}
                            </span>
                        )}
                    </button>
                </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isDark 
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                            }
                        `}
                        title="Refresh data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Perbarui Data
                    </button>
                </div>

                {activeTab === 'violations' ? (
                    <>
                        {/* Violation Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                        <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{violationStats.total}</p>
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Total Pelanggaran</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                                        <Clock className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{violationStats.open}</p>
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Terbuka</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                        <CheckCircle className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{violationStats.resolved}</p>
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Selesai</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Violations Table */}
                        <DataTable
                            key="violations"
                            data={violations}
                            columns={violationColumns}
                            searchPlaceholder="Cari pelanggaran..."
                            selectable
                            bulkActions={[
                                { label: 'Setujui', onClick: handleBulkApprove, variant: 'success' },
                                { label: 'Tolak', onClick: handleBulkReject, variant: 'danger' },
                            ]}
                            onRowDoubleClick={handleViewDetail}
                        />
                    </>
                ) : activeTab === 'leads' ? (
                    <>
                        {/* Lead Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                                        <Briefcase className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{leadStats.total}</p>
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Total Penawaran</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                                        <Clock className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{leadStats.open}</p>
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Belum Ditindaklanjuti</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                        <CheckCircle className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{leadStats.resolved}</p>
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Selesai</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Leads Table */}
                        <DataTable
                            key="leads"
                            data={leads}
                            columns={leadColumns}
                            searchPlaceholder="Cari penawaran..."
                            selectable
                            bulkActions={[
                                { label: 'Setujui', onClick: handleBulkApprove, variant: 'success' },
                                { label: 'Tolak', onClick: handleBulkReject, variant: 'danger' },
                            ]}
                            onRowDoubleClick={handleViewDetail}
                        />
                    </>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <SummaryCard 
                                title="Total Survey" 
                                value={stats.total} 
                                icon={ClipboardList} 
                                color="blue" 
                                active={activeTab === 'all'}
                                onClick={() => setActiveTab('all')}
                            />
                            <SummaryCard 
                                title="Disetujui" 
                                value={stats.approved} 
                                icon={CheckCircle} 
                                color="emerald" 
                                active={activeTab === 'approved'}
                                onClick={() => setActiveTab('approved')}
                            />
                            <SummaryCard 
                                title="Pending" 
                                value={stats.pending} 
                                icon={Clock} 
                                color="amber" 
                                active={activeTab === 'pending'}
                                onClick={() => setActiveTab('pending')}
                            />
                            <SummaryCard 
                                title="Ditolak" 
                                value={stats.rejected} 
                                icon={XCircle} 
                                color="red" 
                                active={activeTab === 'rejected'}
                                onClick={() => setActiveTab('rejected')}
                            />
                        </div>

                        {/* Data Table */}
                        <DataTable
                            key="all"
                            data={filteredSurveys}
                            columns={columns}
                            filters={filters}
                            searchPlaceholder="Cari venue, alamat, atau surveyor..."
                            selectable
                            bulkActions={bulkActions}
                            onSelectionChange={(selected) => console.log('Selected:', selected)}
                            onRowDoubleClick={handleViewDetail}
                        />
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Survey?"
                message={`Apakah Anda yakin ingin menghapus survey "${selectedSurvey?.merchantName}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus"
                cancelText="Batal"
                variant="danger"
            />

            {/* Bulk Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={confirmBulkDelete}
                title="Hapus Survey Terpilih?"
                message={`Apakah Anda yakin ingin menghapus ${selectedSurveys.length} survey? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Ya, Hapus Semua"
                cancelText="Batal"
                variant="danger"
            />

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Survey"
                size="md"
            >
                {selectedSurvey && (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                    {selectedSurvey.venue_name || 'Unknown Venue'}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <ReportTypeBadge type={selectedSurvey.report_type} />
                                    <CategoryBadge category={selectedSurvey.effective_category || selectedSurvey.category} />
                                </div>
                            </div>
                            <StatusBadge status={selectedSurvey.status} />
                        </div>

                        <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Contact Person</p>
                                <p className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{selectedSurvey.effective_contact || '-'}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{selectedSurvey.effective_phone || '-'}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Pengunjung / Kapasitas</p>
                                <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>
                                    {selectedSurvey.actual_visitors || '-'} / {selectedSurvey.effective_capacity || '-'}
                                </p>
                            </div>
                        </div>

                        <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            {selectedSurvey.venue_address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className={`w-4 h-4 mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                    <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedSurvey.venue_address}</p>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <User className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Agent</p>
                                    <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedSurvey.agent_name || 'Unknown'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Tanggal Survey</p>
                                    <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                        {selectedSurvey.created_at ? new Date(selectedSurvey.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {selectedSurvey.effective_description && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-medium ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Deskripsi</span>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedSurvey.effective_description}</p>
                            </div>
                        )}

                        {selectedSurvey.photos && selectedSurvey.photos.length > 0 && (
                            <div className={`pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Camera className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-medium ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Foto Survey ({selectedSurvey.photos.length})</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedSurvey.photos.map((photo, i) => (
                                        <button 
                                            key={i} 
                                            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setSelectedPhoto(photo)}
                                        >
                                            <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedSurvey.admin_notes && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                                <p className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Catatan Admin</p>
                                <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>{selectedSurvey.admin_notes}</p>
                            </div>
                        )}

                        {/* PIC Edit indicator with compare button */}
                        {selectedSurvey.has_pic_edits && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <History className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                        <p className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                            Data telah diedit oleh PIC
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowCompareModal(true)}
                                        className={`text-xs font-medium px-2 py-1 rounded ${isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                    >
                                        Bandingkan & Kembalikan
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </Button>
                            <Button 
                                variant="secondary"
                                onClick={() => handleOpenEdit(selectedSurvey)}
                            >
                                <Pencil className="w-4 h-4" />
                                Edit
                            </Button>
                            {selectedSurvey.status === 'pending' && (
                                <>
                                    <Button 
                                        variant="danger" 
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus(selectedSurvey.id, 'rejected')}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Tolak
                                    </Button>
                                    <Button 
                                        disabled={isUpdating}
                                        onClick={() => handleUpdateStatus(selectedSurvey.id, 'approved')}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Setujui
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Data Survey (PIC)"
                size="md"
            >
                {selectedSurvey && (
                    <div className="space-y-4">
                        <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Perubahan akan disimpan sebagai versi PIC. Data asli dari agent tetap tersimpan.
                        </p>

                        {/* Show agent original vs PIC version indicator */}
                        {selectedSurvey.has_pic_edits && (
                            <div className={`p-2 rounded-lg text-xs ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                                <History className="w-3 h-3 inline mr-1" />
                                Sudah diedit oleh PIC sebelumnya
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <FormInput
                                    label="Contact Person"
                                    name="venue_contact"
                                    value={editForm.venue_contact}
                                    onChange={(e) => setEditForm({ ...editForm, venue_contact: e.target.value })}
                                    placeholder="Nama contact person"
                                />
                                {selectedSurvey.venue_contact && selectedSurvey.pic_venue_contact && (
                                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>
                                        Asli: {selectedSurvey.venue_contact}
                                    </p>
                                )}
                            </div>

                            <div>
                                <FormInput
                                    label="Telepon"
                                    name="venue_phone"
                                    value={editForm.venue_phone}
                                    onChange={(e) => setEditForm({ ...editForm, venue_phone: e.target.value })}
                                    placeholder="Nomor telepon"
                                />
                            </div>

                            <div>
                                <FormSelect
                                    label="Kategori"
                                    name="category"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    placeholder="-- Pilih Kategori --"
                                    options={[
                                        { value: 'commercial', label: 'Komersial' },
                                        { value: 'non_commercial', label: 'Non-Komersial' },
                                    ]}
                                />
                                {selectedSurvey.category && selectedSurvey.pic_category && (
                                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>
                                        Asli: {selectedSurvey.category === 'commercial' ? 'Komersial' : 'Non-Komersial'}
                                    </p>
                                )}
                            </div>

                            <div>
                                <FormInput
                                    label="Kapasitas"
                                    name="capacity_limit"
                                    type="number"
                                    value={editForm.capacity_limit}
                                    onChange={(e) => setEditForm({ ...editForm, capacity_limit: e.target.value })}
                                    placeholder="Kapasitas venue"
                                />
                                {selectedSurvey.capacity_limit && selectedSurvey.pic_capacity_limit && (
                                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>
                                        Asli: {selectedSurvey.capacity_limit}
                                    </p>
                                )}
                            </div>

                            <div>
                                <FormTextarea
                                    label="Deskripsi"
                                    name="description"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    placeholder="Deskripsi tambahan"
                                />
                                {selectedSurvey.description && selectedSurvey.pic_description && (
                                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>
                                        Asli: {selectedSurvey.description.substring(0, 50)}...
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setShowEditModal(false)}>
                                Batal
                            </Button>
                            <Button 
                                onClick={handleSaveEdit}
                                disabled={isEditing}
                            >
                                {isEditing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Compare Modal - Agent vs PIC */}
            <Modal
                isOpen={showCompareModal}
                onClose={() => setShowCompareModal(false)}
                title="Bandingkan Versi Data"
                size="lg"
            >
                {selectedSurvey && selectedSurvey.has_pic_edits && (
                    <div className="space-y-4">
                        <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Diedit oleh: <strong>{selectedSurvey.pic_edited_by}</strong> pada {selectedSurvey.pic_edited_at}
                        </p>

                        {/* Comparison Table */}
                        <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={isDark ? 'bg-emerald-950/50' : 'bg-gray-50'}>
                                        <th className={`px-3 py-2 text-left font-medium ${isDark ? 'text-emerald-400' : 'text-gray-700'}`}>Field</th>
                                        <th className={`px-3 py-2 text-left font-medium ${isDark ? 'text-emerald-400' : 'text-gray-700'}`}>Versi Agent</th>
                                        <th className={`px-3 py-2 text-left font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Versi PIC</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                                    {selectedSurvey.pic_venue_contact !== null && (
                                        <tr className={selectedSurvey.venue_contact !== selectedSurvey.pic_venue_contact ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                            <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Contact Person</td>
                                            <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{selectedSurvey.venue_contact || '-'}</td>
                                            <td className={`px-3 py-2 ${selectedSurvey.venue_contact !== selectedSurvey.pic_venue_contact ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{selectedSurvey.pic_venue_contact || '-'}</td>
                                        </tr>
                                    )}
                                    {selectedSurvey.pic_venue_phone !== null && (
                                        <tr className={selectedSurvey.venue_phone !== selectedSurvey.pic_venue_phone ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                            <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Telepon</td>
                                            <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{selectedSurvey.venue_phone || '-'}</td>
                                            <td className={`px-3 py-2 ${selectedSurvey.venue_phone !== selectedSurvey.pic_venue_phone ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{selectedSurvey.pic_venue_phone || '-'}</td>
                                        </tr>
                                    )}
                                    {selectedSurvey.pic_category !== null && (
                                        <tr className={selectedSurvey.category !== selectedSurvey.pic_category ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                            <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Kategori</td>
                                            <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{selectedSurvey.category === 'commercial' ? 'Komersial' : 'Non-Komersial'}</td>
                                            <td className={`px-3 py-2 ${selectedSurvey.category !== selectedSurvey.pic_category ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{selectedSurvey.pic_category === 'commercial' ? 'Komersial' : 'Non-Komersial'}</td>
                                        </tr>
                                    )}
                                    {selectedSurvey.pic_capacity_limit !== null && (
                                        <tr className={selectedSurvey.capacity_limit !== selectedSurvey.pic_capacity_limit ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                            <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Kapasitas</td>
                                            <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{selectedSurvey.capacity_limit || '-'}</td>
                                            <td className={`px-3 py-2 ${selectedSurvey.capacity_limit !== selectedSurvey.pic_capacity_limit ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{selectedSurvey.pic_capacity_limit || '-'}</td>
                                        </tr>
                                    )}
                                    {selectedSurvey.pic_description !== null && (
                                        <tr className={selectedSurvey.description !== selectedSurvey.pic_description ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                            <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Deskripsi</td>
                                            <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{selectedSurvey.description || '-'}</td>
                                            <td className={`px-3 py-2 ${selectedSurvey.description !== selectedSurvey.pic_description ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{selectedSurvey.pic_description || '-'}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className={`p-3 rounded-lg ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                            <p className={`text-xs ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                                <strong>Kembalikan ke Versi Agent</strong> akan menghapus semua perubahan PIC dan menggunakan data asli dari agent.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setShowCompareModal(false)}>
                                Tutup
                            </Button>
                            <Button 
                                variant="danger"
                                onClick={handleRevertPicEdit}
                                disabled={isReverting}
                            >
                                <History className="w-4 h-4" />
                                {isReverting ? 'Mengembalikan...' : 'Kembalikan ke Versi Agent'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Resolve Violation Confirmation */}
            <ConfirmModal
                isOpen={showResolveConfirm}
                onClose={() => setShowResolveConfirm(false)}
                onConfirm={executeSaveEdit}
                title="Resolve Pelanggaran?"
                message="Pelanggaran ini akan ditandai sebagai resolved setelah data diedit. Lanjutkan?"
                confirmText="Ya, Resolve"
                cancelText="Batal"
                variant="warning"
            />

            {/* Reactivate Violation Confirmation - used by both edit and revert paths */}
            <ConfirmModal
                isOpen={showReactivateConfirm}
                onClose={() => setShowReactivateConfirm(false)}
                onConfirm={() => {
                    // If edit modal is open, this is path 2 (edit back to violating)
                    // Otherwise it's path 1 (revert)
                    if (showEditModal) {
                        executeSaveEdit();
                    } else {
                        executeRevertPicEdit();
                    }
                }}
                title="Aktifkan Kembali Pelanggaran?"
                message="Pelanggaran akan diaktifkan kembali. Lanjutkan?"
                confirmText="Ya, Aktifkan"
                cancelText="Batal"
                variant="danger"
            />

            {/* Photo Lightbox */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                    <img 
                        src={selectedPhoto} 
                        alt="Foto Survey" 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </DashboardLayout>
    );
}
