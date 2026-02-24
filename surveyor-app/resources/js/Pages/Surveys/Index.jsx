import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import DataTable from '@/Components/DataTable';
import Modal, { ConfirmModal } from '@/Components/Modal';
import Button from '@/Components/Button';
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
    Store
} from 'lucide-react';

// Capacity tiers with pricing
const capacityTiers = {
    '≤50': { label: '≤50 orang', price: 5000000 },
    '51-100': { label: '51-100 orang', price: 10000000 },
    '101-250': { label: '101-250 orang', price: 20000000 },
    '251-500': { label: '251-500 orang', price: 40000000 },
    '501-1000': { label: '501-1000 orang', price: 100000000 },
};

// Mock survey data - Venue untuk lisensi Nobar Piala Dunia 2026
const mockSurveys = [
    { id: 1, venueName: 'Warkop Bola Mania', venueType: 'Cafe/Warkop', contactPerson: 'Pak Joko', phone: '08123456789', address: 'Jl. Sudirman No. 45, Jakarta Selatan', area: 'Jakarta Selatan', capacityTier: '≤50', lat: -6.2088, lng: 106.8456, agentName: 'Ahmad Sudrajat', surveyDate: '2024-03-10', status: 'approved', hasPhotos: true, notes: 'Lokasi strategis, 3 TV besar, parkir memadai' },
    { id: 2, venueName: 'Resto Piala Dunia', venueType: 'Restoran', contactPerson: 'Bu Siti', phone: '08234567890', address: 'Jl. Gatot Subroto No. 12, Jakarta Barat', area: 'Jakarta Barat', capacityTier: '51-100', lat: -6.2350, lng: 106.7942, agentName: 'Budi Santoso', surveyDate: '2024-03-10', status: 'approved', hasPhotos: true, notes: 'Kapasitas besar, AC, proyektor tersedia' },
    { id: 3, venueName: 'Kedai Kopi Stadium', venueType: 'Cafe/Warkop', contactPerson: 'Mas Andi', phone: '08345678901', address: 'Jl. Pemuda No. 78, Jakarta Timur', area: 'Jakarta Timur', capacityTier: '≤50', lat: -6.2254, lng: 106.9004, agentName: 'Citra Dewi', surveyDate: '2024-03-10', status: 'pending', hasPhotos: true, notes: 'Menunggu verifikasi dokumen usaha' },
    { id: 4, venueName: 'Bar Kick Off', venueType: 'Bar', contactPerson: 'Mr. Kevin', phone: '08456789012', address: 'Jl. Kemang Raya No. 100, Jakarta Selatan', area: 'Jakarta Selatan', capacityTier: '51-100', lat: -6.2607, lng: 106.8137, agentName: 'Eka Putri', surveyDate: '2024-03-09', status: 'rejected', hasPhotos: false, notes: 'Izin usaha tidak lengkap' },
    { id: 5, venueName: 'Hotel Grand Sport', venueType: 'Hotel/Penginapan', contactPerson: 'Ibu Maya', phone: '08567890123', address: 'Jl. Raya Serpong No. 55, Tangerang', area: 'Tangerang', capacityTier: '101-250', lat: -6.2894, lng: 106.6665, agentName: 'Fajar Ramadhan', surveyDate: '2024-03-09', status: 'approved', hasPhotos: true, notes: 'Ballroom besar, sound system profesional' },
    { id: 6, venueName: 'Lapangan Futsal Jaya', venueType: 'Venue Olahraga', contactPerson: 'Pak Hendra', phone: '08678901234', address: 'Jl. Margonda Raya No. 200, Depok', area: 'Depok', capacityTier: '101-250', lat: -6.3702, lng: 106.8312, agentName: 'Hendra Wijaya', surveyDate: '2024-03-08', status: 'approved', hasPhotos: true, notes: 'Layar LED outdoor, tribun penonton' },
    { id: 7, venueName: 'Balai RW 05 Menteng', venueType: 'Balai Warga/Komunitas', contactPerson: 'Ketua RW', phone: '08789012345', address: 'Jl. Thamrin No. 30, Jakarta Pusat', area: 'Jakarta Pusat', capacityTier: '51-100', lat: -6.1944, lng: 106.8229, agentName: 'Dedi Kurniawan', surveyDate: '2024-03-08', status: 'approved', hasPhotos: true, notes: 'Acara komunitas warga' },
    { id: 8, venueName: 'Cafe Nonton Bareng', venueType: 'Cafe/Warkop', contactPerson: 'Mas Budi', phone: '08890123456', address: 'Jl. Raya Bogor No. 150, Bogor', area: 'Bogor', capacityTier: '≤50', lat: -6.5971, lng: 106.8060, agentName: 'Indah Permata', surveyDate: '2024-03-07', status: 'pending', hasPhotos: true, notes: 'Proses verifikasi kapasitas' },
    { id: 9, venueName: 'Restoran Sunda Goal', venueType: 'Restoran', contactPerson: 'Bu Rina', phone: '08901234567', address: 'Jl. Juanda No. 88, Bekasi', area: 'Bekasi', capacityTier: '101-250', lat: -6.2383, lng: 107.0000, agentName: 'Gita Nuraini', surveyDate: '2024-03-07', status: 'approved', hasPhotos: true, notes: '2 lantai, 4 TV, WiFi gratis' },
    { id: 10, venueName: 'Sport Bar Champions', venueType: 'Bar', contactPerson: 'Mr. David', phone: '08012345678', address: 'Jl. Senopati No. 200, Jakarta Selatan', area: 'Jakarta Selatan', capacityTier: '51-100', lat: -6.2443, lng: 106.8065, agentName: 'Joko Susilo', surveyDate: '2024-03-06', status: 'approved', hasPhotos: true, notes: 'Konsep sport bar, banyak TV' },
    { id: 11, venueName: 'Hotel Bintang Lima', venueType: 'Hotel/Penginapan', contactPerson: 'GM Hotel', phone: '08123456780', address: 'Jl. Merdeka No. 10, Jakarta Pusat', area: 'Jakarta Pusat', capacityTier: '251-500', lat: -6.1751, lng: 106.8272, agentName: 'Lukman Hakim', surveyDate: '2024-03-06', status: 'approved', hasPhotos: true, notes: 'Convention hall, premium venue' },
    { id: 12, venueName: 'GOR Kecamatan Ciputat', venueType: 'Venue Olahraga', contactPerson: 'Kepala GOR', phone: '08234567891', address: 'Jl. Raya Ciputat No. 75, Tangerang', area: 'Tangerang', capacityTier: '251-500', lat: -6.3105, lng: 106.7535, agentName: 'Kartika Sari', surveyDate: '2024-03-05', status: 'pending', hasPhotos: false, notes: 'Menunggu izin pemda' },
];

const statusConfig = {
    approved: { label: 'Disetujui', color: 'emerald' },
    pending: { label: 'Pending', color: 'amber' },
    rejected: { label: 'Ditolak', color: 'red' },
};

const venueTypeConfig = {
    'Cafe/Warkop': 'amber',
    'Restoran': 'blue',
    'Bar': 'purple',
    'Hotel/Penginapan': 'cyan',
    'Venue Olahraga': 'emerald',
    'Balai Warga/Komunitas': 'pink',
    'Lainnya': 'gray',
};

export default function SurveysIndex() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';

    const [surveys] = useState(mockSurveys);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [selectedSurveys, setSelectedSurveys] = useState([]);
    const [activeTab, setActiveTab] = useState('all');

    // Summary stats
    const stats = {
        total: surveys.length,
        approved: surveys.filter(s => s.status === 'approved').length,
        pending: surveys.filter(s => s.status === 'pending').length,
        rejected: surveys.filter(s => s.status === 'rejected').length,
    };

    // Filter by tab
    const filteredSurveys = activeTab === 'all' 
        ? surveys 
        : surveys.filter(s => s.status === activeTab);

    const handleViewDetail = (survey) => {
        setSelectedSurvey(survey);
        setShowDetailModal(true);
    };

    const handleDelete = (survey) => {
        setSelectedSurvey(survey);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        toast.success(`Survey "${selectedSurvey.merchantName}" berhasil dihapus`);
        setShowDeleteModal(false);
        setSelectedSurvey(null);
    };

    const handleBulkApprove = (selected) => {
        toast.success(`${selected.length} survey berhasil disetujui`);
    };

    const handleBulkReject = (selected) => {
        toast.success(`${selected.length} survey berhasil ditolak`);
    };

    const handleBulkDelete = (selected) => {
        setSelectedSurveys(selected);
        setShowBulkDeleteModal(true);
    };

    const confirmBulkDelete = () => {
        toast.success(`${selectedSurveys.length} survey berhasil dihapus`);
        setSelectedSurveys([]);
        setShowBulkDeleteModal(false);
    };

    const handleExport = (selected) => {
        toast.info(`Mengekspor ${selected.length} data survey...`);
    };

    const bulkActions = [
        { label: 'Setujui', icon: CheckCircle, onClick: handleBulkApprove },
        { label: 'Tolak', icon: XCircle, onClick: handleBulkReject },
        { label: 'Export CSV', icon: Download, onClick: handleExport },
        { label: 'Hapus', icon: Trash2, onClick: handleBulkDelete, variant: 'danger' },
    ];

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

    const TypeBadge = ({ type }) => {
        const color = venueTypeConfig[type] || 'gray';
        const colors = {
            blue: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-700',
            purple: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700',
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            pink: isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-50 text-pink-700',
            cyan: isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-50 text-cyan-700',
            gray: isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-50 text-gray-700',
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${colors[color]}`}>
                {type}
            </span>
        );
    };

    const columns = [
        { 
            key: 'venueName', 
            label: 'Venue',
            render: (value, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                        <TypeBadge type={row.venueType} />
                    </div>
                </div>
            )
        },
        { 
            key: 'contactPerson', 
            label: 'Contact Person',
            render: (value, row) => (
                <div>
                    <div className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.phone}</div>
                </div>
            )
        },
        { 
            key: 'address', 
            label: 'Alamat',
            render: (value, row) => (
                <div>
                    <div className={`text-sm truncate max-w-[200px] ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.area}</div>
                </div>
            )
        },
        { 
            key: 'capacityTier', 
            label: 'Kapasitas',
            render: (value) => {
                const tier = capacityTiers[value];
                return (
                    <div>
                        <div className={`font-medium ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>
                            {tier?.label || value}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                            Rp {tier?.price?.toLocaleString('id-ID')}
                        </div>
                    </div>
                );
            }
        },
        { 
            key: 'agentName', 
            label: 'Surveyor',
            render: (value) => (
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                        ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-teal-100 text-teal-700'}
                    `}>
                        {value.charAt(0)}
                    </div>
                    <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{value}</span>
                </div>
            )
        },
        { 
            key: 'surveyDate', 
            label: 'Tanggal',
            render: (value) => (
                <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                    {new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            )
        },
        {
            key: 'hasPhotos',
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
            key: 'venueType',
            label: 'Jenis Venue',
            options: [
                { value: 'Cafe/Warkop', label: 'Cafe/Warkop' },
                { value: 'Restoran', label: 'Restoran' },
                { value: 'Bar', label: 'Bar' },
                { value: 'Hotel/Penginapan', label: 'Hotel/Penginapan' },
                { value: 'Venue Olahraga', label: 'Venue Olahraga' },
                { value: 'Balai Warga/Komunitas', label: 'Balai Warga/Komunitas' },
                { value: 'Lainnya', label: 'Lainnya' },
            ]
        },
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

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Data Survey
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        Kelola data hasil survey venue untuk lisensi Nobar Piala Dunia 2026
                    </p>
                </div>

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
                    data={filteredSurveys}
                    columns={columns}
                    filters={filters}
                    searchPlaceholder="Cari merchant, alamat, atau agen..."
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
                                    {selectedSurvey.venueName}
                                </h3>
                                <TypeBadge type={selectedSurvey.venueType} />
                            </div>
                            <StatusBadge status={selectedSurvey.status} />
                        </div>

                        <div className={`grid grid-cols-2 gap-3 pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Contact Person</p>
                                <p className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{selectedSurvey.contactPerson}</p>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{selectedSurvey.phone}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Kapasitas</p>
                                <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>
                                    {capacityTiers[selectedSurvey.capacityTier]?.label}
                                </p>
                                <p className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                    Rp {capacityTiers[selectedSurvey.capacityTier]?.price?.toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>

                        <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            <div className="flex items-start gap-3">
                                <MapPin className={`w-4 h-4 mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <div>
                                    <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedSurvey.address}</p>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{selectedSurvey.area}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Surveyor</p>
                                    <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedSurvey.agentName}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Tanggal Survey</p>
                                    <span className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                        {new Date(selectedSurvey.surveyDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {selectedSurvey.notes && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <FileText className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-medium ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Catatan</span>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>{selectedSurvey.notes}</p>
                            </div>
                        )}

                        {selectedSurvey.hasPhotos && (
                            <div className={`pt-4 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Camera className={`w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                    <span className={`text-xs font-medium ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Foto Survey</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className={`aspect-square rounded-lg flex items-center justify-center
                                                ${isDark ? 'bg-emerald-950/50' : 'bg-gray-200'}
                                            `}
                                        >
                                            <span className={`text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>Foto {i}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </Button>
                            {selectedSurvey.status === 'pending' && (
                                <>
                                    <Button 
                                        variant="danger" 
                                        onClick={() => {
                                            toast.success('Survey ditolak');
                                            setShowDetailModal(false);
                                        }}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Tolak
                                    </Button>
                                    <Button 
                                        onClick={() => {
                                            toast.success('Survey disetujui');
                                            setShowDetailModal(false);
                                        }}
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
        </DashboardLayout>
    );
}
