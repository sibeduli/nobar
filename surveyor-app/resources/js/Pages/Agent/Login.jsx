import { useState } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Link, router } from '@inertiajs/react';
import { Phone, Lock, Eye, EyeOff, Sun, Moon, LogIn } from 'lucide-react';

export default function AgentLogin() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        phone: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.phone.trim()) {
            newErrors.phone = 'Nomor telepon wajib diisi';
        } else if (!/^08\d{8,12}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Format nomor telepon tidak valid';
        }
        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        
        // Redirect to agent dashboard
        router.visit('/agent');
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
                                    value={formData.phone}
                                    onChange={handleChange}
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
                                    value={formData.password}
                                    onChange={handleChange}
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
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all
                                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                                ${isDark 
                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                                    : 'bg-teal-600 hover:bg-teal-500 text-white'
                                }
                            `}
                        >
                            {isLoading ? (
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
