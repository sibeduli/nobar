import { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import DataTable from '@/Components/DataTable';
import Modal, { ConfirmModal } from '@/Components/Modal';
import Button from '@/Components/Button';
import { router } from '@inertiajs/react';
import {
    Receipt, 
    Send, 
    Clock, 
    DollarSign,
    TrendingUp,
    RefreshCw,
    Eye,
    User,
    Calendar,
    Store,
    Users,
    Percent,
} from 'lucide-react';


export default function Sales({ unbilledSurveys = [], bills = [], stats = {} }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    const urlParams = new URLSearchParams(window.location.search);
    const openSurveyId = urlParams.get('survey');
    
    const [activeTab, setActiveTab] = useState('unbilled');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showSendConfirm, setShowSendConfirm] = useState(false);
    const [pendingSurveyId, setPendingSurveyId] = useState(null);

    useEffect(() => {
        if (openSurveyId) {
            const survey = unbilledSurveys.find(s => s.id === parseInt(openSurveyId));
            if (survey) {
                setSelectedSurvey(survey);
                setShowDetailModal(true);
            }
        }
    }, [openSurveyId, unbilledSurveys]);

    const handleViewDetail = (survey) => {
        setSelectedSurvey(survey);
        setShowDetailModal(true);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['unbilledSurveys', 'bills', 'stats'],
            onFinish: () => setIsRefreshing(false),
        });
    };

    const handleSendBill = (surveyId) => {
        setPendingSurveyId(surveyId);
        setShowSendConfirm(true);
    };

    const confirmSendBill = () => {
        if (!pendingSurveyId) return;
        router.post(`/surveys/${pendingSurveyId}/send-bill`, {}, {
            preserveScroll: true,
            onStart: () => setIsProcessing(true),
            onFinish: () => {
                setIsProcessing(false);
                setShowSendConfirm(false);
                setPendingSurveyId(null);
            },
        });
    };

    const SummaryCard = ({ title, value, icon: Icon, color, small }) => {
        const colorClasses = {
            blue: isDark ? 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20' : 'bg-blue-50 text-blue-600',
            emerald: isDark ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-600',
            amber: isDark ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' : 'bg-amber-50 text-amber-600',
            teal: isDark ? 'bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20' : 'bg-teal-50 text-teal-600',
        };

        return (
            <div
                className={`w-full rounded-xl p-5 text-left
                    ${isDark 
                        ? 'bg-[#0d1414] border border-emerald-900/30' 
                        : 'bg-white border border-gray-200'
                    }
                `}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className={`text-sm ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>{title}</p>
                        <p className={`${small ? 'text-xl' : 'text-3xl'} font-bold mt-1 truncate ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </div>
        );
    };

    const unbilledColumns = [
        {
            key: 'venue_name',
            label: 'Venue',
            render: (v, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{v}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.venue_address}</div>
                </div>
            )
        },
        { key: 'agent_name', label: 'Agent' },
        { key: 'capacity_category', label: 'Kapasitas' },
        {
            key: 'formatted_amount',
            label: 'Total Tagihan',
            render: (v, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{v}</div>
                    <div className={`text-xs ${isDark ? 'text-red-400' : 'text-red-500'}`}>PPN: -{row.formatted_ppn}</div>
                </div>
            )
        },
        {
            key: 'formatted_nett',
            label: 'Nett',
            render: (v) => <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>{v}</span>
        },
        {
            key: 'formatted_commission',
            label: 'Komisi (10%)',
            render: (v) => <span className={`${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{v}</span>
        },
        { key: 'created_at', label: 'Tanggal' },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <div className="flex items-center gap-2">
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
                        onClick={() => handleSendBill(row.id)}
                        disabled={isProcessing}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${isDark ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                    >
                        <Send className="w-3.5 h-3.5" />
                        Kirim
                    </button>
                </div>
            )
        }
    ];

    const billColumns = [
        {
            key: 'bill_number',
            label: 'No. Tagihan',
            render: (v, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{v}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.sent_at}</div>
                </div>
            )
        },
        {
            key: 'merchant_name',
            label: 'Merchant',
            render: (v, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{v}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.merchant_address}</div>
                </div>
            )
        },
        {
            key: 'formatted_amount',
            label: 'Total',
            render: (v, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{v}</div>
                    <div className={`text-xs ${isDark ? 'text-red-400' : 'text-red-500'}`}>PPN: -{row.formatted_ppn}</div>
                </div>
            )
        },
        {
            key: 'formatted_nett',
            label: 'Nett',
            render: (v) => <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>{v}</span>
        },
        { key: 'sent_at', label: 'Tanggal Kirim' },
        { key: 'formatted_commission', label: 'Komisi (10%)' },
    ];

    // Mock referral data (with PPN 11% deducted)
    // CAT 2: 25.000.000 - PPN 11% (2.477.477) = 22.522.523 → Commission 10% = 2.252.252
    // CAT 3: 50.000.000 - PPN 11% (4.954.955) = 45.045.045 → Commission 10% = 4.504.505
    const mockReferrals = [
        {
            id: 1,
            merchant_name: 'Cafe Bola Sejahtera',
            merchant_address: 'Jl. Sudirman No. 100, Jakarta',
            capacity_category: 'CAT 2',
            formatted_amount: 'Rp 25.000.000',
            formatted_ppn: 'Rp 2.477.477',
            formatted_nett: 'Rp 22.522.523',
            formatted_commission: 'Rp 2.252.252',
            registered_at: '2026-03-05',
        },
        {
            id: 2,
            merchant_name: 'Warung Nonton Bahagia',
            merchant_address: 'Jl. Gatot Subroto No. 50, Jakarta',
            capacity_category: 'CAT 3',
            formatted_amount: 'Rp 50.000.000',
            formatted_ppn: 'Rp 4.954.955',
            formatted_nett: 'Rp 45.045.045',
            formatted_commission: 'Rp 4.504.505',
            registered_at: '2026-03-08',
        },
    ];

    const referralColumns = [
        {
            key: 'merchant_name',
            label: 'Merchant',
            render: (v, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{v}</div>
                    <div className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{row.merchant_address}</div>
                </div>
            )
        },
        { key: 'capacity_category', label: 'Kategori' },
        {
            key: 'formatted_amount',
            label: 'Nilai Lisensi',
            render: (v, row) => (
                <div>
                    <div className={`font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>{v}</div>
                    <div className={`text-xs ${isDark ? 'text-red-400' : 'text-red-500'}`}>PPN: -{row.formatted_ppn}</div>
                </div>
            )
        },
        {
            key: 'formatted_nett',
            label: 'Nett',
            render: (v) => <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>{v}</span>
        },
        {
            key: 'formatted_commission',
            label: 'Komisi (10%)',
            render: (v) => <span className={`font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{v}</span>
        },
        { key: 'registered_at', label: 'Tanggal Daftar' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Sales
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        Kelola tagihan dan pantau pendapatan
                    </p>
                </div>

                {/* Stats Cards - Row 1: Counts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryCard 
                        title="Belum Ditagih" 
                        value={stats.unbilled || 0} 
                        icon={Clock} 
                        color="amber" 
                    />
                    <SummaryCard 
                        title="Tagihan Terkirim" 
                        value={stats.sent || 0} 
                        icon={Send} 
                        color="blue" 
                    />
                    <SummaryCard 
                        title="Referral" 
                        value={stats.referrals || 0} 
                        icon={Users} 
                        color="teal" 
                    />
                </div>

                {/* Stats Cards - Row 2: Money */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SummaryCard 
                        title="Total Pendapatan" 
                        value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.total_revenue || 0)} 
                        icon={DollarSign} 
                        color="emerald" 
                        small
                    />
                    <SummaryCard 
                        title="Komisi Anda" 
                        value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.total_commission || 0)} 
                        icon={TrendingUp} 
                        color="emerald" 
                        small
                    />
                    <SummaryCard 
                        title="Rate Komisi" 
                        value="10%" 
                        icon={Percent} 
                        color="blue" 
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-3">
                <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-emerald-950/50' : 'bg-gray-100'}`}>
                    <button
                        onClick={() => setActiveTab('unbilled')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === 'unbilled'
                                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-teal-700 shadow-sm'
                                : isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-600 hover:text-gray-900'
                            }
                        `}
                    >
                        <Clock className="w-4 h-4" />
                        Belum Ditagih
                    </button>
                    <button
                        onClick={() => setActiveTab('bills')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === 'bills'
                                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-teal-700 shadow-sm'
                                : isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-600 hover:text-gray-900'
                            }
                        `}
                    >
                        <Receipt className="w-4 h-4" />
                        Tagihan
                    </button>
                    <button
                        onClick={() => setActiveTab('referrals')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === 'referrals'
                                ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-teal-700 shadow-sm'
                                : isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-600 hover:text-gray-900'
                            }
                        `}
                    >
                        <Users className="w-4 h-4" />
                        Referral
                    </button>
                </div>
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
                        Perbarui Data
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'unbilled' && (
                    <DataTable
                        key="unbilled"
                        data={unbilledSurveys}
                        columns={unbilledColumns}
                        searchKeys={['venue_name', 'venue_address', 'agent_name']}
                        searchPlaceholder="Cari venue..."
                        emptyMessage="Tidak ada survey yang perlu ditagih"
                    />
                )}
                {activeTab === 'bills' && (
                    <DataTable
                        key="bills"
                        data={bills}
                        columns={billColumns}
                        searchKeys={['bill_number', 'merchant_name', 'merchant_address']}
                        searchPlaceholder="Cari tagihan..."
                        emptyMessage="Belum ada tagihan"
                    />
                )}
                {activeTab === 'referrals' && (
                    <DataTable
                        key="referrals"
                        data={mockReferrals}
                        columns={referralColumns}
                        searchKeys={['merchant_name', 'merchant_address']}
                        searchPlaceholder="Cari merchant..."
                        emptyMessage="Belum ada referral"
                    />
                )}
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Tagihan"
                size="md"
            >
                {selectedSurvey && (
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                    <Store className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <div>
                                    <h3 className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                        {selectedSurvey.venue_name}
                                    </h3>
                                    <p className={`text-sm ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>
                                        {selectedSurvey.venue_address}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                                    <User className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Agent</p>
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                        {selectedSurvey.agent_name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                                    <Calendar className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Tanggal</p>
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                        {selectedSurvey.created_at}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-gray-50 border border-gray-200'}`}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Kapasitas</p>
                                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                        {selectedSurvey.capacity_category}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Total Tagihan</p>
                                    <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>
                                        {selectedSurvey.formatted_amount}
                                    </p>
                                </div>
                                <div>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Komisi Anda</p>
                                    <p className={`text-lg font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                                        {selectedSurvey.formatted_commission}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </Button>
                            <Button 
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleSendBill(selectedSurvey.id);
                                }}
                                disabled={isProcessing}
                            >
                                <Send className="w-4 h-4" />
                                Kirim Tagihan
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Send Bill Confirm Modal */}
            <ConfirmModal
                isOpen={showSendConfirm}
                onClose={() => {
                    setShowSendConfirm(false);
                    setPendingSurveyId(null);
                }}
                onConfirm={confirmSendBill}
                title="Kirim Tagihan"
                message="Kirim tagihan ke merchant? Survey akan terkunci setelah tagihan dikirim."
                confirmText="Kirim"
                isLoading={isProcessing}
            />

        </DashboardLayout>
    );
}
