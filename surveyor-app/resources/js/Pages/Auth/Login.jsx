import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Button from '@/Components/Button';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    ArrowRight,
    Sun,
    Moon,
} from 'lucide-react';

export default function Login() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        // Redirect would happen here
        window.location.href = '/';
    };

    const handleGoogleLogin = () => {
        // Redirect to Google OAuth
        window.location.href = '/auth/google';
    };

    return (
        <div className={`min-h-screen flex ${isDark ? 'bg-[#080c0c]' : 'bg-gray-50'}`}>
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
            {/* Left Side - Branding */}
            <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-emerald-900/50 to-[#080c0c]' : 'bg-gradient-to-br from-teal-600 to-teal-800'}`}>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
                </div>
                <div className="relative z-10 flex flex-col justify-center px-16">
                    <div className="mb-8">
                        <img 
                            src={isDark ? '/TVRI-logo-dark.svg' : '/TVRI-logo.svg'} 
                            alt="TVRI" 
                            className="h-12"
                        />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Surveyor Portal
                    </h1>
                    <p className="text-xl text-white/80 mb-8">
                        Nobar Piala Dunia 2026
                    </p>
                    <p className="text-white/60 max-w-md">
                        Platform manajemen surveyor untuk verifikasi venue dan lisensi penayangan Piala Dunia 2026.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <img 
                            src={isDark ? '/TVRI-logo-dark.svg' : '/TVRI-logo.svg'} 
                            alt="TVRI" 
                            className="h-10 mx-auto mb-4"
                        />
                        <h1 className={`text-xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Surveyor Portal
                        </h1>
                    </div>

                    <div className="mb-8">
                        <h2 className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                            Masuk ke akun Anda
                        </h2>
                        <p className={`mt-2 text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-600'}`}>
                            Belum punya akun?{' '}
                            <Link href="/register" className={`font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}>
                                Daftar sekarang
                            </Link>
                        </p>
                    </div>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors mb-6
                            ${isDark 
                                ? 'bg-[#0d1414] border-emerald-900/50 text-emerald-50 hover:bg-emerald-950/50' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }
                        `}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Masuk dengan Google
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className={`w-full border-t ${isDark ? 'border-emerald-900/50' : 'border-gray-200'}`}></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className={`px-4 ${isDark ? 'bg-[#080c0c] text-emerald-500/60' : 'bg-gray-50 text-gray-500'}`}>
                                atau masuk dengan email
                            </span>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                Email
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nama@email.com"
                                    className={`w-full rounded-xl border pl-11 pr-4 py-3 text-sm transition-colors
                                        ${errors.email 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                                            : isDark 
                                                ? 'bg-[#0d1414] border-emerald-900/50 text-emerald-50 placeholder-emerald-500/40 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20'
                                        }
                                    `}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                    Password
                                </label>
                                <Link href="/forgot-password" className={`text-xs font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}>
                                    Lupa password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-emerald-500/60' : 'text-gray-400'}`} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Masukkan password"
                                    className={`w-full rounded-xl border pl-11 pr-11 py-3 text-sm transition-colors
                                        ${errors.password 
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
                                            : isDark 
                                                ? 'bg-[#0d1414] border-emerald-900/50 text-emerald-50 placeholder-emerald-500/40 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20' 
                                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20'
                                        }
                                    `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="remember"
                                id="remember"
                                checked={formData.remember}
                                onChange={handleChange}
                                className={`w-4 h-4 rounded border transition-colors
                                    ${isDark 
                                        ? 'bg-[#0d1414] border-emerald-900/50 text-emerald-500 focus:ring-emerald-500/20' 
                                        : 'border-gray-300 text-teal-600 focus:ring-teal-500/20'
                                    }
                                `}
                            />
                            <label htmlFor="remember" className={`ml-2 text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                Ingat saya
                            </label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3 justify-center"
                            loading={isLoading}
                        >
                            <LogIn className="w-4 h-4" />
                            Masuk
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className={`mt-8 text-center text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>
                        © 2026 TVRI. Hak cipta dilindungi.
                    </p>
                </div>
            </div>
        </div>
    );
}
