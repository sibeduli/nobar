import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    LayoutDashboard,
    Building2,
    Users,
    UserPlus,
    List,
    Activity,
    ClipboardList,
    FileCheck,
    AlertTriangle,
    Map,
    MousePointerClick,
    HelpCircle,
    Search,
    ChevronLeft,
    ChevronDown,
    Bell,
    User,
    Sun,
    Moon,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Profil Perusahaan', href: '/company-profile', icon: Building2 },
    { 
        name: 'Agen Survey', 
        icon: Users,
        children: [
            { name: 'Lihat Agen', href: '/agents', icon: List },
            { name: 'Daftar Agen', href: '/agents/create', icon: UserPlus },
            { name: 'Aktivitas Agen', href: '/agents/activities', icon: Activity },
        ]
    },
    { 
        name: 'Data Survey', 
        icon: ClipboardList,
        children: [
            { name: 'Semua Survey', href: '/surveys', icon: FileCheck },
            { name: 'Pelanggaran', href: '/surveys?tab=violations', icon: AlertTriangle },
        ]
    },
    { name: 'Peta Venue', href: '/venues/map', icon: Map },
    { name: 'Aktivitas PIC', href: '/pic/activities', icon: MousePointerClick },
    { name: 'Pusat Bantuan', href: '/help', icon: HelpCircle },
];

function NavItem({ item, collapsed, theme, currentPath, expandedMenus, toggleMenu }) {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.name);
    const isActive = item.href ? currentPath === item.href : false;
    const isChildActive = hasChildren && item.children.some(child => currentPath === child.href);

    const activeClass = theme === 'dark' 
        ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
        : 'bg-teal-50 text-teal-700';
    const inactiveClass = theme === 'dark'
        ? 'text-emerald-100/70 hover:bg-emerald-500/10 hover:text-emerald-300'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
    const parentActiveClass = theme === 'dark'
        ? 'text-emerald-400'
        : 'text-teal-700';

    if (hasChildren) {
        return (
            <div>
                <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${isChildActive ? parentActiveClass : inactiveClass}
                    `}
                >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left">{item.name}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </>
                    )}
                </button>
                {!collapsed && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-emerald-900/20 pl-3">
                        {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildItemActive = currentPath === child.href;
                            return (
                                <Link
                                    key={child.name}
                                    href={child.href}
                                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                                        ${isChildItemActive ? activeClass : inactiveClass}
                                    `}
                                >
                                    <ChildIcon className="w-4 h-4 flex-shrink-0" />
                                    <span>{child.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive ? activeClass : inactiveClass}
            `}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.name}</span>}
        </Link>
    );
}

export default function DashboardLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState(['Agen Survey']);
    const { theme, toggleTheme } = useTheme();
    const { url } = usePage();

    const isDark = theme === 'dark';
    const currentPath = url.split('?')[0];

    const toggleMenu = (menuName) => {
        setExpandedMenus(prev => 
            prev.includes(menuName) 
                ? prev.filter(m => m !== menuName)
                : [...prev, menuName]
        );
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0a0f0f]' : 'bg-gray-50'}`}>
            {/* Sidebar */}
            <aside 
                className={`fixed top-0 left-0 h-full transition-all duration-300 z-40
                    ${sidebarCollapsed ? 'w-16' : 'w-64'}
                    ${isDark ? 'bg-[#0d1414] border-r border-emerald-900/30' : 'bg-white border-r border-gray-200'}
                `}
            >
                {/* Logo */}
                <div className={`h-16 flex items-center justify-between px-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center gap-3">
                            <img 
                                src={isDark ? '/TVRI-logo-dark.svg' : '/TVRI-logo.svg'}
                                alt="TVRI" 
                                className="w-10 h-10 object-contain"
                            />
                            <div>
                                <div className={`font-semibold text-sm ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Nobar</div>
                                <div className={`text-xs ${isDark ? 'text-emerald-500' : 'text-gray-500'}`}>Surveyor Portal</div>
                            </div>
                        </div>
                    )}
                    {sidebarCollapsed && (
                        <img 
                            src={isDark ? '/TVRI-logo-dark.svg' : '/TVRI-logo.svg'}
                            alt="TVRI" 
                            className="w-10 h-10 object-contain mx-auto"
                        />
                    )}
                </div>

                {/* User Info */}
                {!sidebarCollapsed && (
                    <div className={`px-4 py-4 border-b ${isDark ? 'border-emerald-900/30' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-500/20 ring-1 ring-emerald-500/30' : 'bg-teal-100'}`}>
                                <User className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm truncate ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Abdullah Said</div>
                                <div className={`text-xs ${isDark ? 'text-emerald-500/80' : 'text-gray-500'}`}>Login terakhir: Hari ini</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search */}
                {!sidebarCollapsed && (
                    <div className="px-4 py-3">
                        <div className="relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors
                                    ${isDark 
                                        ? 'bg-emerald-950/30 border border-emerald-900/50 text-emerald-100 placeholder:text-emerald-500/40 focus:ring-emerald-500/50' 
                                        : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-teal-500'
                                    }
                                `}
                            />
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="px-3 py-2 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    {navigation.map((item) => (
                        <NavItem 
                            key={item.name} 
                            item={item} 
                            collapsed={sidebarCollapsed} 
                            theme={theme} 
                            currentPath={currentPath}
                            expandedMenus={expandedMenus}
                            toggleMenu={toggleMenu}
                        />
                    ))}
                </nav>

                {/* Collapse Button */}
                <div className="absolute bottom-4 left-0 right-0 px-3">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors
                            ${isDark 
                                ? 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }
                        `}
                    >
                        <ChevronLeft className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                        {!sidebarCollapsed && <span>Collapse</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                {/* Top Header */}
                <header className={`h-16 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors
                    ${isDark ? 'bg-[#0d1414] border-b border-emerald-900/30' : 'bg-white border-b border-gray-200'}
                `}>
                    <div>
                        <h1 className={`text-xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>Selamat datang, Abdullah!</h1>
                        <p className={`text-sm ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>Kelola venue dan agen Anda di sini.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Theme Switcher */}
                        <button 
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-colors
                                ${isDark 
                                    ? 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10' 
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }
                            `}
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button className={`relative p-2 rounded-lg transition-colors
                            ${isDark 
                                ? 'text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }
                        `}>
                            <Bell className="w-5 h-5" />
                            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isDark ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                        </button>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center
                            ${isDark ? 'bg-emerald-500/20 ring-1 ring-emerald-500/30' : 'bg-teal-100'}
                        `}>
                            <User className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-teal-600'}`} />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
