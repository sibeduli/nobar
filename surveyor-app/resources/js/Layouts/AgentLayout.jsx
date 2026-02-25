import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    Home,
    ClipboardList,
    Plus,
    User,
    Sun,
    Moon,
    LogOut,
} from 'lucide-react';

const navigation = [
    { name: 'Beranda', href: '/agent', icon: Home },
    { name: 'Profil', href: '/agent/profile', icon: User },
    { name: 'Baru', href: '/agent/report', icon: Plus, isCenter: true },
    { name: 'Laporan', href: '/agent/surveys', icon: ClipboardList },
    { name: 'Keluar', href: '/agent/login', icon: LogOut, isLogout: true },
];

export default function AgentLayout({ children }) {
    const { theme, toggleTheme } = useTheme();
    const { url } = usePage();
    const isDark = theme === 'dark';

    // Get current path without query params
    const currentPath = url.split('?')[0];

    // Mock agent data
    const agent = {
        name: 'Ahmad Sudrajat',
        phone: '08123456789',
    };

    return (
        <div className={`min-h-screen pb-20 transition-colors duration-300 ${isDark ? 'bg-[#0a0f0f]' : 'bg-gray-50'}`}>
            {/* Top Header */}
            <header className={`h-14 flex items-center justify-between px-4 sticky top-0 z-30 transition-colors
                ${isDark ? 'bg-[#0d1414] border-b border-emerald-900/30' : 'bg-white border-b border-gray-200'}
            `}>
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img 
                        src={isDark ? '/TVRI-logo-dark.svg' : '/TVRI-logo.svg'}
                        alt="TVRI" 
                        className="w-8 h-8 object-contain"
                    />
                    <div>
                        <div className={`text-sm font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Nobar</div>
                        <div className={`text-[10px] ${isDark ? 'text-emerald-500' : 'text-gray-500'}`}>Agen Survey</div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg transition-colors
                            ${isDark 
                                ? 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }
                        `}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                </div>
            </header>

            {/* Main Content */}
            <main className="p-4">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className={`fixed bottom-0 left-0 right-0 z-40 transition-colors
                ${isDark ? 'bg-[#0d1414] border-t border-emerald-900/30' : 'bg-white border-t border-gray-200'}
            `}>
                <div className="flex items-center justify-around h-16">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.href || 
                            (item.href !== '/agent' && currentPath.startsWith(item.href));
                        
                        if (item.isCenter) {
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-center w-14 h-14 -mt-6 rounded-full shadow-lg transition-all
                                        ${isDark 
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-400' 
                                            : 'bg-teal-600 text-white hover:bg-teal-500'
                                        }
                                    `}
                                >
                                    <Icon className="w-7 h-7" />
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-2 transition-colors
                                    ${item.isLogout
                                        ? isDark ? 'text-red-400' : 'text-red-500'
                                        : isActive
                                            ? isDark ? 'text-emerald-400' : 'text-teal-600'
                                            : isDark ? 'text-emerald-500/50 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-600'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
