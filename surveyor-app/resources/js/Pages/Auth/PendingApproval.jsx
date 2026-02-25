import { Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Button from '@/Components/Button';
import {
    Clock,
    Mail,
    LogOut,
    Sun,
    Moon,
    RefreshCw,
} from 'lucide-react';

export default function PendingApproval() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const handleLogout = () => {
        window.location.href = '/logout';
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className={`min-h-screen flex items-center justify-center px-6 py-12 ${isDark ? 'bg-[#080c0c]' : 'bg-gray-50'}`}>
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={`fixed top-4 right-4 z-50 p-2.5 rounded-xl transition-colors
                    ${isDark 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'
                    }
                `}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img 
                        src={isDark ? '/TVRI-logo-dark.svg' : '/TVRI-logo.svg'} 
                        alt="TVRI" 
                        className="h-12 mx-auto mb-4"
                    />
                    <h1 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Surveyor Portal
                    </h1>
                </div>

                {/* Card */}
                <div className={`rounded-2xl p-8 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <div className="text-center">
                        {/* Icon */}
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>
                            <Clock className={`w-10 h-10 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                        </div>

                        <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Menunggu Persetujuan
                        </h2>
                        
                        <p className={`text-sm mb-6 ${isDark ? 'text-emerald-500/60' : 'text-gray-600'}`}>
                            Pendaftaran Anda sedang ditinjau oleh admin. Anda akan menerima email notifikasi setelah akun Anda disetujui.
                        </p>

                        {/* Status Info */}
                        <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-emerald-950/30' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`}></div>
                                <span className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                                    Status: Pending Review
                                </span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-emerald-500/50' : 'text-gray-500'}`}>
                                Biasanya membutuhkan waktu 1-2 hari kerja
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button
                                variant="ghost"
                                className="w-full justify-center"
                                onClick={handleRefresh}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Cek Status
                            </Button>

                            <button
                                onClick={handleLogout}
                                className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-colors
                                    ${isDark 
                                        ? 'text-red-400 hover:bg-red-500/10' 
                                        : 'text-red-600 hover:bg-red-50'
                                    }
                                `}
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Help */}
                    <div className={`mt-6 pt-6 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}`}>
                        <p className={`text-center text-xs ${isDark ? 'text-emerald-500/50' : 'text-gray-500'}`}>
                            Ada pertanyaan? Hubungi{' '}
                            <a 
                                href="mailto:support@tvri.co.id" 
                                className={`font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}
                            >
                                support@tvri.co.id
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className={`mt-8 text-center text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>
                    © 2026 TVRI. Hak cipta dilindungi.
                </p>
            </div>
        </div>
    );
}
