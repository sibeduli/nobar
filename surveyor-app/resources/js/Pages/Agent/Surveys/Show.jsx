import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { Link } from '@inertiajs/react';
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
} from 'lucide-react';

// Mock survey data
const mockSurvey = {
    id: 1,
    venueName: 'Warkop Bola Mania',
    venueType: 'Cafe/Warkop',
    contactPerson: 'Pak Joko',
    phone: '08123456789',
    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
    area: 'Jakarta Selatan',
    capacityTier: '≤50',
    lat: -6.2088,
    lng: 106.8456,
    status: 'approved',
    date: '2024-03-10',
    notes: 'Lokasi strategis, 3 TV besar, parkir memadai',
    photos: [
        '/placeholder-venue-1.jpg',
        '/placeholder-venue-2.jpg',
        '/placeholder-venue-3.jpg',
    ],
};

export default function AgentSurveysShow({ id }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const survey = mockSurvey; // In real app, fetch by id

    const StatusBadge = ({ status }) => {
        const config = {
            approved: { label: 'Disetujui', color: 'emerald', icon: CheckCircle },
            pending: { label: 'Pending', color: 'amber', icon: Clock },
            rejected: { label: 'Ditolak', color: 'red', icon: XCircle },
        };
        const { label, color, icon: Icon } = config[status];
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
                                {survey.venueName}
                            </h2>
                            <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                {survey.venueType}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Photos */}
                {survey.photos && survey.photos.length > 0 && (
                    <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className={`flex items-center gap-2 p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}`}>
                            <Camera className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                Foto Venue ({survey.photos.length})
                            </h3>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-3 gap-2">
                                {survey.photos.map((photo, index) => (
                                    <div key={index} className={`aspect-square rounded-lg overflow-hidden ${isDark ? 'bg-emerald-950/50' : 'bg-gray-100'}`}>
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Camera className={`w-8 h-8 ${isDark ? 'text-emerald-500/30' : 'text-gray-300'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Venue Info */}
                <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                        Informasi Venue
                    </h3>
                    
                    <InfoRow icon={User} label="Nama Kontak" value={survey.contactPerson} />
                    <InfoRow icon={Phone} label="Telepon" value={survey.phone} />
                    <InfoRow icon={MapPin} label="Alamat" value={survey.address} />
                    <InfoRow icon={Users} label="Kapasitas" value={survey.capacityTier + ' orang'} />
                    <InfoRow icon={Calendar} label="Tanggal Survey" value={new Date(survey.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
                    
                    <div className={`flex items-start gap-3 py-3`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                            ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}
                        `}>
                            <Navigation className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Koordinat GPS</p>
                            <p className={`text-sm mt-0.5 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                {survey.lat.toFixed(6)}, {survey.lng.toFixed(6)}
                            </p>
                            <a
                                href={`https://www.google.com/maps?q=${survey.lat},${survey.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}
                            >
                                Buka di Google Maps
                            </a>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {survey.notes && (
                    <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                                Catatan
                            </h3>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                            {survey.notes}
                        </p>
                    </div>
                )}

                {/* Status Info */}
                {survey.status === 'rejected' && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <XCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            <h3 className={`text-sm font-semibold ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                                Alasan Penolakan
                            </h3>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-red-400/80' : 'text-red-600'}`}>
                            Izin usaha tidak lengkap. Mohon lengkapi dokumen yang diperlukan.
                        </p>
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
            </div>
        </AgentLayout>
    );
}
