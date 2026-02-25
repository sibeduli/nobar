import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Button from '@/Components/Button';
import {
    Mail,
    ArrowLeft,
    Send,
    CheckCircle,
    Sun,
    Moon,
} from 'lucide-react';

export default function ForgotPassword() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            setError('Email wajib diisi');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Format email tidak valid');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setIsSubmitted(true);
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
                    {!isSubmitted ? (
                        <>
                            <div className="text-center mb-6">
                                <h2 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                    Lupa Password?
                                </h2>
                                <p className={`mt-2 text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-600'}`}>
                                    Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError('');
                                            }}
                                            placeholder="nama@email.com"
                                            className={`w-full rounded-xl border pl-11 pr-4 py-3 text-sm transition-colors
                                                ${error 
                                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                                                    : isDark 
                                                        ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-50 placeholder-emerald-500/40 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20' 
                                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20'
                                                }
                                            `}
                                        />
                                    </div>
                                    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full py-3 justify-center"
                                    loading={isLoading}
                                >
                                    <Send className="w-4 h-4" />
                                    Kirim Link Reset
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                                <CheckCircle className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                                Email Terkirim!
                            </h2>
                            <p className={`text-sm mb-6 ${isDark ? 'text-emerald-500/60' : 'text-gray-600'}`}>
                                Kami telah mengirimkan link reset password ke <span className="font-medium">{email}</span>. Silakan cek inbox atau folder spam Anda.
                            </p>
                            <Button
                                variant="ghost"
                                className="mx-auto"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setEmail('');
                                }}
                            >
                                Kirim ulang email
                            </Button>
                        </div>
                    )}

                    {/* Back to Login */}
                    <div className="mt-6 pt-6 border-t ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}">
                        <Link
                            href="/login"
                            className={`flex items-center justify-center gap-2 text-sm font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali ke halaman login
                        </Link>
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
