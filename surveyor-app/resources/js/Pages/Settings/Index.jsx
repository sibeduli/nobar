import { useState, useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { useToast } from '@/Contexts/ToastContext';
import { ConfirmModal } from '@/Components/Modal';
import FormInput from '@/Components/FormInput';
import Button from '@/Components/Button';
import {
    User,
    Lock,
    Smartphone,
    Monitor,
    LogOut,
    Save,
    X,
    Edit3,
    Mail,
    Phone,
    Calendar,
    Shield,
    Trash2,
    AlertTriangle,
    KeyRound,
    QrCode,
} from 'lucide-react';

export default function SettingsIndex({ user, sessions: initialSessions = [] }) {
    const { theme } = useTheme();
    const toast = useToast();
    const isDark = theme === 'dark';
    const { flash } = usePage().props;

    // Get tab from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');

    // Edit mode states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const url = new URL(window.location);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url);
    };

    const [sessions, setSessions] = useState(initialSessions);
    const [revokingSession, setRevokingSession] = useState(null);
    const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);

    // Update sessions when props change
    useEffect(() => {
        setSessions(initialSessions);
    }, [initialSessions]);

    const initialProfileData = {
        name: user?.name || '',
        phone: user?.phone || '',
    };

    // Profile form
    const { data: profileData, setData: setProfileData, put: putProfile, processing: processingProfile, errors: profileErrors, reset: resetProfile } = useForm(initialProfileData);

    // Password form
    const { data: passwordData, setData: setPasswordData, put: putPassword, processing: processingPassword, errors: passwordErrors, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            setIsEditingProfile(false);
            setIsEditingPassword(false);
            setShowSaveModal(false);
            setShowPasswordModal(false);
        }
    }, [flash?.success]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(name, value);
    };

    const handleSaveProfile = () => {
        setShowSaveModal(true);
    };

    const confirmSaveProfile = () => {
        putProfile('/settings/profile', {
            onSuccess: () => {
                setShowSaveModal(false);
                setIsEditingProfile(false);
            },
            onError: () => {
                setShowSaveModal(false);
            },
        });
    };

    const handleCancelProfile = () => {
        if (JSON.stringify(profileData) !== JSON.stringify(initialProfileData)) {
            setShowCancelModal(true);
        } else {
            setIsEditingProfile(false);
        }
    };

    const confirmCancelProfile = () => {
        resetProfile();
        setIsEditingProfile(false);
        setShowCancelModal(false);
        toast.info('Perubahan dibatalkan');
    };

    const handleSavePassword = () => {
        setShowPasswordModal(true);
    };

    const confirmSavePassword = () => {
        putPassword('/settings/password', {
            onSuccess: () => {
                resetPassword();
                setShowPasswordModal(false);
                setIsEditingPassword(false);
            },
            onError: () => {
                setShowPasswordModal(false);
            },
        });
    };

    const revokeSession = (sessionId) => {
        setRevokingSession(sessionId);
        router.delete(`/settings/sessions/${sessionId}`, {
            onSuccess: () => {
                setSessions(sessions.filter(s => s.id !== sessionId));
                setRevokingSession(null);
            },
            onError: () => {
                setRevokingSession(null);
                toast.error('Gagal menghapus sesi');
            },
        });
    };

    const revokeAllSessions = () => {
        setShowRevokeAllModal(true);
    };

    const confirmRevokeAllSessions = () => {
        router.delete('/settings/sessions', {
            onSuccess: () => {
                setSessions(sessions.filter(s => s.current));
                setShowRevokeAllModal(false);
            },
            onError: () => {
                setShowRevokeAllModal(false);
                toast.error('Gagal menghapus sesi');
            },
        });
    };

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'security', label: 'Keamanan', icon: Lock },
        { id: 'sessions', label: 'Sesi Aktif', icon: Smartphone },
    ];

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-3 py-3">
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
                <div className="overflow-x-auto -mx-6 px-6">
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
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className={`rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                        {/* Header with Edit Button */}
                        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}`}>
                            <h2 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                Informasi Profil
                            </h2>
                            {!isEditingProfile ? (
                                <Button variant="secondary" size="sm" onClick={() => setIsEditingProfile(true)}>
                                    <Edit3 className="w-4 h-4" />
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={handleCancelProfile}>
                                        <X className="w-4 h-4" />
                                        Batal
                                    </Button>
                                    <Button variant="primary" size="sm" onClick={handleSaveProfile} loading={processingProfile}>
                                        <Save className="w-4 h-4" />
                                        Simpan
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            {!isEditingProfile ? (
                                /* View Mode */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <InfoRow icon={User} label="Nama Lengkap" value={profileData.name} />
                                    <InfoRow icon={Mail} label="Email" value={user?.email} />
                                    <InfoRow icon={Phone} label="Nomor Telepon" value={profileData.phone} />
                                </div>
                            ) : (
                                /* Edit Mode */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Nama Lengkap"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleProfileChange}
                                        error={profileErrors.name}
                                        required
                                    />
                                    <FormInput
                                        label="Email"
                                        name="email"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                    />
                                    <FormInput
                                        label="Nomor Telepon"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        error={profileErrors.phone}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Password Change */}
                        <div className={`rounded-xl ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}`}>
                            {/* Header */}
                            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}`}>
                                <div>
                                    <h2 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                        Password
                                    </h2>
                                    <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                        Kelola password akun Anda
                                    </p>
                                </div>
                                {!isEditingPassword ? (
                                    <Button variant="secondary" size="sm" onClick={() => setIsEditingPassword(true)}>
                                        <Edit3 className="w-4 h-4" />
                                        Ubah Password
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => { resetPassword(); setIsEditingPassword(false); }}>
                                            <X className="w-4 h-4" />
                                            Batal
                                        </Button>
                                        <Button variant="primary" size="sm" onClick={handleSavePassword} loading={processingPassword}>
                                            <Save className="w-4 h-4" />
                                            Simpan
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                {!isEditingPassword ? (
                                    /* View Mode */
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-teal-50'}`}>
                                            <Lock className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                                        </div>
                                        <div>
                                            <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>Password</p>
                                            <p className={`text-sm ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>••••••••</p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Edit Mode */
                                    <div className="space-y-4 max-w-md">
                                        <FormInput
                                            label="Password Saat Ini"
                                            name="current_password"
                                            type="password"
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData('current_password', e.target.value)}
                                            placeholder="Masukkan password saat ini"
                                            error={passwordErrors.current_password}
                                            required
                                        />
                                        <FormInput
                                            label="Password Baru"
                                            name="password"
                                            type="password"
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData('password', e.target.value)}
                                            placeholder="Masukkan password baru"
                                            error={passwordErrors.password}
                                            required
                                        />
                                        <FormInput
                                            label="Konfirmasi Password Baru"
                                            name="password_confirmation"
                                            type="password"
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                            placeholder="Konfirmasi password baru"
                                            required
                                        />
                                        <p className={`text-xs ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                            Password minimal 8 karakter
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

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
                        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                            <div>
                                <h2 className={`text-lg font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                    Sesi Aktif
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                                    Kelola perangkat yang sedang login ke akun Anda
                                </p>
                            </div>
                            {sessions.filter(s => !s.current).length > 0 && (
                                <Button variant="danger" size="sm" onClick={revokeAllSessions} className="w-full sm:w-auto justify-center">
                                    <LogOut className="w-4 h-4" />
                                    Logout Semua Perangkat Lain
                                </Button>
                            )}
                        </div>

                        <div className={`divide-y ${isDark ? 'divide-emerald-900/30' : 'divide-gray-100'}`}>
                            {sessions.map(session => (
                                <div key={session.id} className="p-4 flex items-start sm:items-center justify-between gap-3">
                                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                                            {session.device.includes('iPhone') || session.device.includes('Android') ? (
                                                <Smartphone className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                            ) : (
                                                <Monitor className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-gray-600'}`} />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className={`font-medium ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                                    {session.device}
                                                </p>
                                                {session.current && (
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                                        Sesi Ini
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
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
                                            disabled={revokingSession === session.id}
                                            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'} ${revokingSession === session.id ? 'opacity-50 cursor-not-allowed' : ''}`}
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

            {/* Save Profile Modal */}
            <ConfirmModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onConfirm={confirmSaveProfile}
                title="Simpan Perubahan"
                message="Apakah Anda yakin ingin menyimpan perubahan profil?"
                confirmText="Simpan"
                confirmVariant="primary"
                loading={processingProfile}
            />

            {/* Cancel Profile Modal */}
            <ConfirmModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancelProfile}
                title="Batalkan Perubahan"
                message="Perubahan yang belum disimpan akan hilang. Lanjutkan?"
                confirmText="Ya, Batalkan"
                confirmVariant="danger"
            />

            {/* Save Password Modal */}
            <ConfirmModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onConfirm={confirmSavePassword}
                title="Ubah Password"
                message="Apakah Anda yakin ingin mengubah password?"
                confirmText="Ubah Password"
                confirmVariant="primary"
                loading={processingPassword}
            />

            {/* Revoke All Sessions Modal */}
            <ConfirmModal
                isOpen={showRevokeAllModal}
                onClose={() => setShowRevokeAllModal(false)}
                onConfirm={confirmRevokeAllSessions}
                title="Logout Semua Perangkat Lain"
                message="Semua sesi aktif di perangkat lain akan dihapus. Anda harus login ulang di perangkat tersebut."
                confirmText="Ya, Logout Semua"
                confirmVariant="danger"
            />
        </DashboardLayout>
    );
}
