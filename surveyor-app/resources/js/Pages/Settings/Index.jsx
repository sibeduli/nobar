import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import Button from '@/Components/Button';
import {
    User,
    Lock,
    Smartphone,
    Monitor,
    Globe,
    LogOut,
    Save,
    Eye,
    EyeOff,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Trash2,
    AlertTriangle,
    KeyRound,
    QrCode,
} from 'lucide-react';

// Mock current user data
const mockUser = {
    name: 'Admin TVRI',
    email: 'admin@tvri.co.id',
    phone: '08123456789',
    position: 'PIC Surveyor',
    authProvider: 'google', // 'google' or 'email'
    avatar: null,
    createdAt: '2024-01-15',
    twoFactorEnabled: false,
};

// Mock active sessions
const mockSessions = [
    { id: 1, device: 'Chrome on Windows', ip: '192.168.1.100', location: 'Jakarta, Indonesia', lastActive: '2024-03-10T15:30:00', current: true },
    { id: 2, device: 'Safari on iPhone', ip: '192.168.1.105', location: 'Jakarta, Indonesia', lastActive: '2024-03-10T10:00:00', current: false },
    { id: 3, device: 'Firefox on MacOS', ip: '103.28.12.45', location: 'Bandung, Indonesia', lastActive: '2024-03-08T14:20:00', current: false },
];

export default function SettingsIndex() {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';

    // Get tab from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const url = new URL(window.location);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url);
    };
    const [user, setUser] = useState(mockUser);
    const [sessions, setSessions] = useState(mockSessions);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });
    const [profileForm, setProfileForm] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone,
        position: user.position,
    });

    const handleProfileChange = (e) => {
        setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const saveProfile = () => {
        toast.success('Profil berhasil disimpan');
    };

    const changePassword = () => {
        if (passwords.new !== passwords.confirm) {
            toast.error('Password baru tidak cocok');
            return;
        }
        if (passwords.new.length < 8) {
            toast.error('Password minimal 8 karakter');
            return;
        }
        toast.success('Password berhasil diubah');
        setPasswords({ current: '', new: '', confirm: '' });
    };

    const revokeSession = (sessionId) => {
        setSessions(sessions.filter(s => s.id !== sessionId));
        toast.success('Sesi berhasil dihapus');
    };

    const revokeAllSessions = () => {
        setSessions(sessions.filter(s => s.current));
        toast.success('Semua sesi lain berhasil dihapus');
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'security', label: 'Keamanan', icon: Lock },
        { id: 'sessions', label: 'Sesi Aktif', icon: Smartphone },
    ];

    const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, disabled, icon: Icon }) => (
        <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors
                        ${Icon ? 'pl-10' : ''}
                        ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
                        ${isDark 
                            ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-50 placeholder-emerald-500/40 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20'
                        }
                    `}
                />
            </div>
        </div>
    );

    const PasswordInput = ({ label, name, value, onChange, placeholder, show, onToggle }) => (
        <div>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                {label}
            </label>
            <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                <input
                    type={show ? 'text' : 'password'}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full rounded-lg border pl-10 pr-10 py-2 text-sm transition-colors
                        ${isDark 
                            ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-50 placeholder-emerald-500/40 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20'
                        }
                    `}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Pengaturan
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                        Kelola profil dan keamanan akun Anda
                    </p>
                </div>

                {/* Tabs */}
                <div className={`flex gap-1 p-1 rounded-xl w-fit ${isDark ? 'bg-emerald-950/50' : 'bg-gray-100'}`}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${activeTab === tab.id
                                        ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-teal-700 shadow-sm'
                                        : isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-600 hover:text-gray-900'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Informasi Profil
                        </h2>

                        {user.authProvider === 'google' && (
                            <div className={`flex items-center gap-3 p-3 rounded-lg mb-6 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                                <Globe className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                <div>
                                    <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                        Masuk dengan Google
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-blue-400/70' : 'text-blue-600'}`}>
                                        Email tidak dapat diubah. Lengkapi profil Anda di bawah.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Nama Lengkap"
                                name="name"
                                value={profileForm.name}
                                onChange={handleProfileChange}
                                placeholder="Masukkan nama lengkap"
                                icon={User}
                            />
                            <FormInput
                                label="Email"
                                name="email"
                                type="email"
                                value={profileForm.email}
                                onChange={handleProfileChange}
                                placeholder="Masukkan email"
                                disabled={user.authProvider === 'google'}
                                icon={Mail}
                            />
                            <FormInput
                                label="Nomor Telepon"
                                name="phone"
                                value={profileForm.phone}
                                onChange={handleProfileChange}
                                placeholder="Masukkan nomor telepon"
                                icon={Phone}
                            />
                            <FormInput
                                label="Jabatan"
                                name="position"
                                value={profileForm.position}
                                onChange={handleProfileChange}
                                placeholder="Masukkan jabatan"
                                icon={User}
                            />
                        </div>

                        <div className="flex justify-end mt-6">
                            <Button variant="primary" onClick={saveProfile}>
                                <Save className="w-4 h-4" />
                                Simpan Profil
                            </Button>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Password Change - Only for non-Google users */}
                        {user.authProvider !== 'google' ? (
                            <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                    Ubah Password
                                </h2>

                                <div className="space-y-4 max-w-md">
                                    <PasswordInput
                                        label="Password Saat Ini"
                                        name="current"
                                        value={passwords.current}
                                        onChange={handlePasswordChange}
                                        placeholder="Masukkan password saat ini"
                                        show={showCurrentPassword}
                                        onToggle={() => setShowCurrentPassword(!showCurrentPassword)}
                                    />
                                    <PasswordInput
                                        label="Password Baru"
                                        name="new"
                                        value={passwords.new}
                                        onChange={handlePasswordChange}
                                        placeholder="Masukkan password baru"
                                        show={showNewPassword}
                                        onToggle={() => setShowNewPassword(!showNewPassword)}
                                    />
                                    <PasswordInput
                                        label="Konfirmasi Password Baru"
                                        name="confirm"
                                        value={passwords.confirm}
                                        onChange={handlePasswordChange}
                                        placeholder="Konfirmasi password baru"
                                        show={showConfirmPassword}
                                        onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />

                                    <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                        Password minimal 8 karakter dengan kombinasi huruf dan angka
                                    </p>

                                    <Button variant="primary" onClick={changePassword}>
                                        <Lock className="w-4 h-4" />
                                        Ubah Password
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                                        <Shield className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                                    </div>
                                    <div>
                                        <h2 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                            Keamanan Akun Google
                                        </h2>
                                        <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                            Akun Anda diamankan oleh Google. Kelola keamanan melalui pengaturan akun Google Anda.
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href="https://myaccount.google.com/security"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-2 mt-4 text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                                >
                                    <Globe className="w-4 h-4" />
                                    Buka Pengaturan Keamanan Google
                                </a>
                            </div>
                        )}

                        {/* Two-Factor Authentication */}
                        <div className={`rounded-xl p-6 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                        <KeyRound className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <div>
                                        <h2 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                            Autentikasi Dua Faktor (2FA)
                                        </h2>
                                        <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                            Tambahkan lapisan keamanan ekstra dengan kode verifikasi dari aplikasi authenticator
                                        </p>
                                        {user.twoFactorEnabled ? (
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                                    <Shield className="w-3 h-3" />
                                                    Aktif
                                                </span>
                                                <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                    Diaktifkan pada 15 Jan 2024
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-700'}`}>
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Tidak Aktif
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button 
                                    variant={user.twoFactorEnabled ? 'danger' : 'primary'} 
                                    size="sm"
                                    onClick={() => {
                                        if (user.twoFactorEnabled) {
                                            toast.success('2FA berhasil dinonaktifkan');
                                        } else {
                                            toast.info('Fitur 2FA akan segera tersedia');
                                        }
                                    }}
                                >
                                    {user.twoFactorEnabled ? (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            Nonaktifkan
                                        </>
                                    ) : (
                                        <>
                                            <QrCode className="w-4 h-4" />
                                            Aktifkan 2FA
                                        </>
                                    )}
                                </Button>
                            </div>

                            {!user.twoFactorEnabled && (
                                <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                                    <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-900'}`}>
                                        Cara mengaktifkan 2FA:
                                    </h3>
                                    <ol className={`text-sm space-y-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                        <li>1. Install aplikasi authenticator (Google Authenticator, Authy, dll)</li>
                                        <li>2. Klik tombol "Aktifkan 2FA" di atas</li>
                                        <li>3. Scan QR code dengan aplikasi authenticator</li>
                                        <li>4. Masukkan kode 6 digit untuk verifikasi</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Sessions Tab */}
                {activeTab === 'sessions' && (
                    <div className={`rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}">
                            <div>
                                <h2 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                    Sesi Aktif
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                    Kelola perangkat yang sedang login ke akun Anda
                                </p>
                            </div>
                            {sessions.filter(s => !s.current).length > 0 && (
                                <Button variant="danger" size="sm" onClick={revokeAllSessions}>
                                    <LogOut className="w-4 h-4" />
                                    Logout Semua Perangkat Lain
                                </Button>
                            )}
                        </div>

                        <div className="divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}">
                            {sessions.map(session => (
                                <div key={session.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                                            {session.device.includes('iPhone') || session.device.includes('Android') ? (
                                                <Smartphone className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                            ) : (
                                                <Monitor className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                                    {session.device}
                                                </p>
                                                {session.current && (
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        Sesi Ini
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                    <MapPin className="w-3 h-3" />
                                                    {session.location}
                                                </span>
                                                <span className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                    IP: {session.ip}
                                                </span>
                                                <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(session.lastActive).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!session.current && (
                                        <button
                                            onClick={() => revokeSession(session.id)}
                                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {sessions.length === 0 && (
                            <div className="p-8 text-center">
                                <Smartphone className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-emerald-500/40' : 'text-gray-300'}`} />
                                <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                    Tidak ada sesi aktif lainnya
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
