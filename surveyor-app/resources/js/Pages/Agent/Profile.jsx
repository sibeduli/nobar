import AgentLayout from '@/Layouts/AgentLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    ClipboardList,
    CheckCircle,
    Info,
} from 'lucide-react';

// Mock agent data
const mockAgent = {
    name: 'Ahmad Sudrajat',
    phone: '08123456789',
    email: 'ahmad.sudrajat@email.com',
    nik: '3201234567890001',
    address: 'Jl. Sudirman No. 45, Jakarta Selatan',
    areas: ['Jakarta Selatan', 'Jakarta Pusat'],
    joinDate: '2024-01-15',
    status: 'active',
    totalSurveys: 45,
    approvedSurveys: 38,
};

export default function AgentProfile() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

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
                        {mockAgent.name.charAt(0)}
                    </div>
                    <h1 className={`text-xl font-bold mt-3 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        {mockAgent.name}
                    </h1>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full mt-2
                        ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}
                    `}>
                        <CheckCircle className="w-3 h-3" />
                        Agen Aktif
                    </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>{mockAgent.totalSurveys}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Total Survey</p>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <p className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-teal-600'}`}>{mockAgent.approvedSurveys}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Disetujui</p>
                    </div>
                </div>

                {/* Profile Info */}
                <div className={`rounded-xl p-4 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                    <h2 className={`text-sm font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-teal-700'}`}>
                        Informasi Profil
                    </h2>
                    
                    <InfoRow icon={Phone} label="Nomor Telepon" value={mockAgent.phone} />
                    <InfoRow icon={Mail} label="Email" value={mockAgent.email || 'Tidak ada'} />
                    <InfoRow icon={User} label="NIK" value={mockAgent.nik} />
                    <InfoRow icon={MapPin} label="Alamat" value={mockAgent.address} />
                    <InfoRow icon={Calendar} label="Bergabung" value={new Date(mockAgent.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
                    
                    <div className={`flex items-start gap-3 py-3`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                            ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}
                        `}>
                            <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Area Tugas</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {mockAgent.areas.map((area, idx) => (
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
        </AgentLayout>
    );
}
