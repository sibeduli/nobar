import { useState, useEffect } from 'react';
import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import QRCode from 'qrcode';
import Button from '@/Components/Button';
import AgentIdCard from '@/Components/AgentIdCard';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    ClipboardList,
    CheckCircle,
    XCircle,
    Info,
    QrCode as QrCodeIcon,
    Download,
} from 'lucide-react';

export default function AgentProfile({ agent, company }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [showIdCardModal, setShowIdCardModal] = useState(false);

    // Generate QR code on mount
    useEffect(() => {
        if (agent?.qr_code) {
            QRCode.toDataURL(agent.qr_code, {
                width: 200,
                margin: 2,
                color: {
                    dark: isDark ? '#10b981' : '#0d9488',
                    light: '#ffffff',
                },
                errorCorrectionLevel: 'H',
            }).then(setQrDataUrl).catch(console.error);
        }
    }, [agent?.qr_code, isDark]);

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
                <div className="text-center">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold
                        ${isDark ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30' : 'bg-teal-100 text-teal-700'}
                    `}>
                        {agent.name?.charAt(0) || 'A'}
                    </div>
                    <h1 className={`text-xl font-bold mt-3 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        {agent.name}
                    </h1>
                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        {company.name}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full mt-2
                        ${agent.status === 'active'
                            ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                            : (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700')
                        }
                    `}>
                        {agent.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {agent.status === 'active' ? 'Agen Aktif' : 'Agen Nonaktif'}
                    </span>
                </div>

                {/* Agent QR Code for Merchant */}
                <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <QrCodeIcon className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                        <h2 className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                            QR Code Agen
                        </h2>
                    </div>
                    <p className={`text-xs mb-3 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        Tunjukkan QR ini kepada merchant untuk verifikasi identitas Anda
                    </p>
                    <div className="flex justify-center">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-white' : 'bg-gray-50'}`}>
                            {qrDataUrl ? (
                                <img 
                                    src={qrDataUrl}
                                    alt="QR Code Agen"
                                    className="w-44 h-44"
                                />
                            ) : (
                                <div className="w-44 h-44 flex items-center justify-center">
                                    <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                                </div>
                            )}
                        </div>
                    </div>
                    <p className={`text-xs text-center mt-3 font-mono ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>
                        {agent.qr_code}
                    </p>

                    {/* Download ID Card Button */}
                    <div className="flex justify-center mt-4">
                        <Button onClick={() => setShowIdCardModal(true)}>
                            <Download className="w-4 h-4" />
                            Unduh Kartu ID
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>{agent.total_surveys}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Total Survey</p>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>{agent.approved_surveys}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Disetujui</p>
                    </div>
                </div>

                {/* Profile Info */}
                <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h2 className={`text-sm font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                        Informasi Profil
                    </h2>
                    
                    <InfoRow icon={Phone} label="Nomor Telepon" value={agent.phone} />
                    <InfoRow icon={Mail} label="Email" value={agent.email || 'Tidak ada'} />
                    <InfoRow icon={User} label="NIK" value={agent.nik} />
                    <InfoRow icon={MapPin} label="Alamat" value={agent.address || 'Tidak ada'} />
                    <InfoRow icon={Calendar} label="Bergabung" value={agent.join_date ? new Date(agent.join_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} />
                    
                    <div className={`flex items-start gap-3 py-3`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                            ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}
                        `}>
                            <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Area Tugas</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {(agent.areas || []).map((area, idx) => (
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
                </div>

                {/* Info Notice */}
                <div className={`flex items-start gap-3 p-4 rounded-xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                    <Info className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            Profil Anda dikelola oleh PIC
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-blue-400/70' : 'text-blue-600'}`}>
                            Hubungi PIC perusahaan Anda jika ada perubahan data atau lupa password
                        </p>
                    </div>
                </div>
            </div>

            {/* Agent ID Card Modal */}
            <AgentIdCard
                agent={agent}
                company={company}
                isOpen={showIdCardModal}
                onClose={() => setShowIdCardModal(false)}
            />
        </AgentLayout>
    );
}
