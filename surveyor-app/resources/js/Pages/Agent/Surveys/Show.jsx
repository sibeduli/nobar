import { useState } from 'react';
import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import Button from '@/Components/Button';
import {
    ArrowLeft,
    Store,
    MapPin,
    Phone,
    User,
    Users,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    Camera,
    FileText,
    Navigation,
    AlertTriangle,
    ShieldCheck,
    History,
} from 'lucide-react';

// Report type labels
const REPORT_TYPES = {
    verified: { label: 'Terverifikasi', color: 'emerald', icon: ShieldCheck },
    verified_non_commercial: { label: 'Non-Komersial', color: 'emerald', icon: ShieldCheck },
    violation_invalid_qr: { label: 'QR Invalid', color: 'red', icon: AlertTriangle },
    violation_capacity: { label: 'Melebihi Kapasitas', color: 'red', icon: AlertTriangle },
    violation_ads: { label: 'Iklan Ilegal', color: 'red', icon: AlertTriangle },
    violation_no_license: { label: 'Tanpa Lisensi', color: 'red', icon: AlertTriangle },
    violation_venue: { label: 'Venue Tidak Sesuai', color: 'red', icon: AlertTriangle },
    lead: { label: 'Penawaran Lisensi', color: 'blue', icon: FileText },
    documentation: { label: 'Dokumentasi', color: 'blue', icon: FileText },
    other: { label: 'Lainnya', color: 'gray', icon: FileText },
};

export default function AgentSurveysShow({ survey }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [showPicChangesModal, setShowPicChangesModal] = useState(false);

    if (!survey) {
        return (
            <AgentLayout>
                <div className="p-8 text-center">
                    <p className={isDark ? 'text-emerald-500/60' : 'text-gray-500'}>Survey tidak ditemukan</p>
                </div>
            </AgentLayout>
        );
    }

    const StatusBadge = ({ status }) => {
        const config = {
            approved: { label: 'Disetujui', color: 'emerald', icon: CheckCircle },
            pending: { label: 'Pending', color: 'amber', icon: Clock },
            rejected: { label: 'Ditolak', color: 'red', icon: XCircle },
        };
        const { label, color, icon: Icon } = config[status] || config.pending;
        const colors = {
            emerald: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            amber: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700',
            red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700',
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${colors[color]}`}>
                <Icon className="w-4 h-4" />
                {label}
            </span>
        );
    };

    const ReportTypeBadge = ({ type }) => {
        const config = REPORT_TYPES[type] || REPORT_TYPES.other;
        const colors = {
            emerald: isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
            red: isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700',
            blue: isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-700',
            gray: isDark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-50 text-gray-700',
        };
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md ${colors[config.color]}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className={`flex items-start gap-3 py-3 border-b ${isDark ? 'border-emerald-900/20' : 'border-gray-100'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}
            `}>
                <Icon className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{label}</p>
                <p className={`text-sm mt-0.5 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value || '-'}</p>
            </div>
        </div>
    );

    return (
        <AgentLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/agent/surveys"
                        className={`p-2 rounded-lg transition-colors
                            ${isDark 
                                ? 'text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }
                        `}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className={`text-lg font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Detail Survey
                        </h1>
                    </div>
                    <StatusBadge status={survey.status} />
                </div>

                {/* Venue Name Card */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                            ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}
                        `}>
                            <Store className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                        </div>
                        <div>
                            <h2 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                {survey.venue_name || 'Unknown Venue'}
                            </h2>
                            <ReportTypeBadge type={survey.report_type} />
                        </div>
                    </div>
                </div>

                {/* Photos */}
                {survey.photos && survey.photos.length > 0 && (
                    <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className={`flex items-center gap-2 p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}`}>
                            <Camera className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                Foto ({survey.photos.length})
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-3 gap-2">
                                {survey.photos.map((photo, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                        <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Venue Info */}
                <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                        Informasi
                    </h3>
                    
                    <InfoRow icon={User} label="Nama Kontak" value={survey.venue_contact} />
                    <InfoRow icon={Phone} label="Telepon" value={survey.venue_phone} />
                    <InfoRow icon={MapPin} label="Alamat" value={survey.venue_address} />
                    {(survey.actual_visitors || survey.capacity_limit) && (
                        <InfoRow icon={Users} label="Pengunjung / Kapasitas" value={`${survey.actual_visitors || '-'} / ${survey.capacity_limit || '-'}`} />
                    )}
                    <InfoRow icon={Calendar} label="Tanggal Survey" value={survey.created_at ? new Date(survey.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
                    
                    {(survey.latitude && survey.longitude) && (
                        <div className={`flex items-start gap-3 py-3`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}
                            `}>
                                <Navigation className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Koordinat GPS</p>
                                <p className={`text-sm mt-0.5 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                    {parseFloat(survey.latitude).toFixed(6)}, {parseFloat(survey.longitude).toFixed(6)}
                                </p>
                                <a
                                    href={`https://www.google.com/maps?q=${survey.latitude},${survey.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1 text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}
                                >
                                    Buka di Google Maps
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Description */}
                {survey.description && (
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                Deskripsi
                            </h3>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                            {survey.description}
                        </p>
                    </div>
                )}

                {/* Admin Notes */}
                {survey.admin_notes && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                Catatan Admin
                            </h3>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                            {survey.admin_notes}
                        </p>
                        {survey.reviewed_by && (
                            <p className={`text-xs mt-2 ${isDark ? 'text-amber-400/60' : 'text-amber-600/70'}`}>
                                Direview oleh: {survey.reviewed_by} {survey.reviewed_at && `pada ${survey.reviewed_at}`}
                            </p>
                        )}
                    </div>
                )}

                {/* Status Info */}
                {survey.status === 'rejected' && !survey.admin_notes && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-2">
                            <XCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                                Survey ditolak
                            </p>
                        </div>
                    </div>
                )}

                {survey.status === 'pending' && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="flex items-center gap-2">
                            <Clock className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            <p className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                                Survey sedang dalam proses review oleh PIC
                            </p>
                        </div>
                    </div>
                )}

                {/* PIC Changes Indicator */}
                {survey.has_pic_edits && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                    Data telah diubah oleh PIC
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPicChangesModal(true)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                            >
                                Lihat Perubahan
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* PIC Changes Modal */}
            <Modal
                isOpen={showPicChangesModal}
                onClose={() => setShowPicChangesModal(false)}
                title="Perubahan oleh PIC"
                size="md"
            >
                <div className="space-y-4">
                    <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        PIC telah mengubah beberapa data pada survey ini. Perubahan tidak mengubah laporan asli Anda.
                    </p>

                    {/* Comparison Table */}
                    <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={isDark ? 'bg-emerald-950/50' : 'bg-gray-50'}>
                                    <th className={`px-3 py-2 text-left font-medium ${isDark ? 'text-emerald-400' : 'text-gray-700'}`}>Field</th>
                                    <th className={`px-3 py-2 text-left font-medium ${isDark ? 'text-emerald-400' : 'text-gray-700'}`}>Data Anda</th>
                                    <th className={`px-3 py-2 text-left font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Perubahan PIC</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                                {survey.pic_venue_contact !== null && (
                                    <tr className={survey.venue_contact !== survey.pic_venue_contact ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                        <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Contact Person</td>
                                        <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{survey.venue_contact || '-'}</td>
                                        <td className={`px-3 py-2 ${survey.venue_contact !== survey.pic_venue_contact ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{survey.pic_venue_contact || '-'}</td>
                                    </tr>
                                )}
                                {survey.pic_venue_phone !== null && (
                                    <tr className={survey.venue_phone !== survey.pic_venue_phone ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                        <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Telepon</td>
                                        <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{survey.venue_phone || '-'}</td>
                                        <td className={`px-3 py-2 ${survey.venue_phone !== survey.pic_venue_phone ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{survey.pic_venue_phone || '-'}</td>
                                    </tr>
                                )}
                                {survey.pic_category !== null && (
                                    <tr className={survey.category !== survey.pic_category ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                        <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Kategori</td>
                                        <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{survey.category === 'commercial' ? 'Komersial' : 'Non-Komersial'}</td>
                                        <td className={`px-3 py-2 ${survey.category !== survey.pic_category ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{survey.pic_category === 'commercial' ? 'Komersial' : 'Non-Komersial'}</td>
                                    </tr>
                                )}
                                {survey.pic_capacity_limit !== null && (
                                    <tr className={survey.capacity_limit !== survey.pic_capacity_limit ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                        <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Kapasitas</td>
                                        <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{survey.capacity_limit || '-'}</td>
                                        <td className={`px-3 py-2 ${survey.capacity_limit !== survey.pic_capacity_limit ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{survey.pic_capacity_limit || '-'}</td>
                                    </tr>
                                )}
                                {survey.pic_description !== null && (
                                    <tr className={survey.description !== survey.pic_description ? (isDark ? 'bg-amber-500/10' : 'bg-amber-50') : ''}>
                                        <td className={`px-3 py-2 font-medium ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>Deskripsi</td>
                                        <td className={`px-3 py-2 ${isDark ? 'text-emerald-300' : 'text-gray-700'}`}>{survey.description || '-'}</td>
                                        <td className={`px-3 py-2 ${survey.description !== survey.pic_description ? (isDark ? 'text-amber-300 font-medium' : 'text-amber-700 font-medium') : (isDark ? 'text-blue-300' : 'text-blue-700')}`}>{survey.pic_description || '-'}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        Diubah oleh: {survey.pic_edited_by} pada {survey.pic_edited_at}
                    </p>

                    <div className="flex justify-end pt-2">
                        <Button variant="ghost" onClick={() => setShowPicChangesModal(false)}>
                            Tutup
                        </Button>
                    </div>
                </div>
            </Modal>
        </AgentLayout>
    );
}
