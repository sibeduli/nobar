import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Button from '@/Components/Button';
import FormInput from '@/Components/FormInput';
import {
    Mail,
    Lock,
    User,
    Phone,
    Building2,
    UserPlus,
    CheckCircle,
    Sun,
    Moon,
    Key,
} from 'lucide-react';

export default function Register() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    // Get kode from URL query param
    const urlParams = new URLSearchParams(window.location.search);
    const kodeFromUrl = urlParams.get('kode') || '';

    const { data, setData, post, processing, errors } = useForm({
        kodeAkses: kodeFromUrl,
        name: '',
        email: '',
        phone: '',
        companyName: '',
        password: '',
        password_confirmation: '',
        agreeTerms: false,
    });
    const [clientErrors, setClientErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setData(name, type === 'checkbox' ? checked : value);
        if (clientErrors[name]) {
            setClientErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        
        if (!data.agreeTerms) {
            newErrors.agreeTerms = 'Anda harus menyetujui syarat dan ketentuan';
        }

        if (Object.keys(newErrors).length > 0) {
            setClientErrors(newErrors);
            return;
        }

        post('/register');
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
                        Bergabung Sekarang
                    </h1>
                    <p className="text-xl text-white/80 mb-8">
                        Surveyor Portal - Nobar Piala Dunia 2026
                    </p>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-white/20'}`}>
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-white/80">Kelola tim surveyor dengan mudah</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-white/20'}`}>
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-white/80">Pantau survey venue secara real-time</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-white/20'}`}>
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-white/80">Laporan pelanggaran terintegrasi</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 overflow-y-auto">
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
                            Daftar akun baru
                        </h2>
                        <p className={`mt-2 text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-600'}`}>
                            Sudah punya akun?{' '}
                            <Link href="/login" className={`font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}>
                                Masuk di sini
                            </Link>
                        </p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Kode Akses - First Field */}
                        <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                            <p className={`text-xs mb-2 ${isDark ? 'text-amber-400/60' : 'text-amber-600'}`}>
                                Kode akses diberikan oleh TVRI kepada mitra resmi
                            </p>
                            <FormInput
                                label="Kode Akses"
                                name="kodeAkses"
                                value={data.kodeAkses}
                                onChange={handleChange}
                                placeholder="Masukkan kode akses"
                                error={errors.kodeAkses}
                                icon={Key}
                                variant="amber"
                                required
                            />
                        </div>

                        <FormInput
                            label="Nama Lengkap"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            placeholder="Masukkan nama lengkap"
                            error={errors.name}
                            icon={User}
                            required
                        />

                        <FormInput
                            label="Email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="nama@email.com"
                            error={errors.email}
                            icon={Mail}
                            required
                        />

                        <FormInput
                            label="Nomor Telepon"
                            name="phone"
                            value={data.phone}
                            onChange={handleChange}
                            placeholder="08xxxxxxxxxx"
                            error={errors.phone}
                            icon={Phone}
                            required
                        />

                        <FormInput
                            label="Nama Perusahaan"
                            name="companyName"
                            value={data.companyName}
                            onChange={handleChange}
                            placeholder="PT Nama Perusahaan"
                            error={errors.companyName}
                            icon={Building2}
                            required
                        />

                        <FormInput
                            label="Password"
                            name="password"
                            type="password"
                            value={data.password}
                            onChange={handleChange}
                            placeholder="Minimal 8 karakter"
                            error={errors.password}
                            icon={Lock}
                            required
                        />

                        <FormInput
                            label="Konfirmasi Password"
                            name="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={handleChange}
                            placeholder="Ulangi password"
                            error={errors.password_confirmation || clientErrors.password_confirmation}
                            icon={Lock}
                            required
                        />

                        {/* Terms */}
                        <div>
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    id="agreeTerms"
                                    checked={data.agreeTerms}
                                    onChange={handleChange}
                                    className={`mt-0.5 w-4 h-4 rounded border transition-colors
                                        ${isDark 
                                            ? 'bg-[#0d1414] border-emerald-900/50 text-emerald-500 focus:ring-emerald-500/20' 
                                            : 'border-gray-300 text-teal-600 focus:ring-teal-500/20'
                                        }
                                    `}
                                />
                                <label htmlFor="agreeTerms" className={`ml-2 text-sm ${isDark ? 'text-emerald-100' : 'text-gray-700'}`}>
                                    Saya menyetujui{' '}
                                    <a href="#" className={`font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}>
                                        Syarat dan Ketentuan
                                    </a>
                                    {' '}serta{' '}
                                    <a href="#" className={`font-medium ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}`}>
                                        Kebijakan Privasi
                                    </a>
                                </label>
                            </div>
                            {(errors.agreeTerms || clientErrors.agreeTerms) && <p className="mt-1.5 text-xs text-red-500">{errors.agreeTerms || clientErrors.agreeTerms}</p>}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3 justify-center"
                            loading={processing}
                        >
                            <UserPlus className="w-4 h-4" />
                            Daftar Sekarang
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
