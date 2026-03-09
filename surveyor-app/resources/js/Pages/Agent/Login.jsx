import { useState } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useForm } from '@inertiajs/react';
import { Phone, Lock, Eye, EyeOff, Sun, Moon, LogIn } from 'lucide-react';

export default function AgentLogin() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const { data, setData, post, processing, errors } = useForm({
        phone: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/agent/login');
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#0a0f0f]' : 'bg-gray-50'}`}>
            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className={`fixed top-4 right-4 p-2 rounded-lg transition-colors z-10
                    ${isDark 
                        ? 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }
                `}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <img 
                        src={isDark ? '/TVRI-logo-dark.svg' : '/TVRI-logo.svg'}
                        alt="TVRI" 
                        className="w-20 h-20 mx-auto mb-4"
                    />
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>
                        Nobar Surveyor
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>
                        Login Agen Lapangan
                    </p>
                </div>

                {/* Login Form */}
                <div className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200 shadow-sm'}`}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Phone Input */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2
                                        ${errors.phone
                                            ? 'border-red-500 focus:ring-red-500/50'
                                            : isDark 
                                                ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                                        }
                                    `}
                                />
                            </div>
                            {errors.phone && <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan password"
                                    className={`w-full pl-11 pr-11 py-3 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2
                                        ${errors.password
                                            ? 'border-red-500 focus:ring-red-500/50'
                                            : isDark 
                                                ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                                        }
                                    `}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-emerald-500/50 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all
                                ${processing ? 'opacity-70 cursor-not-allowed' : ''}
                                ${isDark 
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                                    : 'bg-teal-600 hover:bg-teal-500 text-white'
                                }
                            `}
                        >
                            {processing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Masuk
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Help Text */}
                <p className={`mt-6 text-center text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>
                    Hubungi PIC perusahaan Anda jika lupa password
                </p>
            </div>

            {/* Footer */}
            <div className={`py-4 text-center text-xs ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}>
                © 2026 TVRI Nobar. All rights reserved.
            </div>
        </div>
    );
}
