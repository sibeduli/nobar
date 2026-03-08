import { Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Button from '@/Components/Button';
import FormInput from '@/Components/FormInput';
import { Mail, Lock, LogIn, Sun, Moon } from 'lucide-react';

export default function Login() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(name, type === 'checkbox' ? checked : value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login');
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

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <FormInput
                            label="Email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="nama@email.com"
                            error={errors.email}
                            icon={Mail}
                        />

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className={`text-sm font-medium ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                    Password
                                </label>
                                <Link href="/forgot-password" className={`text-xs font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}>
                                    Lupa password?
                                </Link>
                            </div>
                            <FormInput
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={handleChange}
                                placeholder="Masukkan password"
                                error={errors.password}
                                icon={Lock}
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="remember"
                                id="remember"
                                checked={data.remember}
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
                            loading={processing}
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
