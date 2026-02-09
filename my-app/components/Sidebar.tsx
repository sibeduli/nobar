'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Store,
  FileText,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Venue Saya',
    href: '/dashboard/venues',
    icon: <Store className="w-5 h-5" />,
    children: [
      { label: 'Daftar Venue', href: '/dashboard/venues/daftar' },
      { label: 'Semua Venue', href: '/dashboard/venues' },
    ],
  },
  {
    label: 'Lisensi',
    href: '/dashboard/licenses',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Pembayaran',
    href: '/dashboard/payments',
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    label: 'Pengaturan',
    href: '/dashboard/settings',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    label: 'Bantuan',
    href: '/dashboard/help',
    icon: <HelpCircle className="w-5 h-5" />,
  },
];

interface SidebarProps {
  children: React.ReactNode;
}

interface UserData {
  lastLoginAt: string | null;
}

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserData(data.user);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  const formatLastLogin = (dateStr: string | null) => {
    if (!dateStr) return 'Belum pernah login';
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' WIB';
  };

  const toggleExpanded = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string, exact: boolean = false) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (item.label.toLowerCase().includes(query)) return true;
    if (item.children?.some(child => child.label.toLowerCase().includes(query))) return true;
    return false;
  });

  const renderMenu = () => (
    <ul className="space-y-1">
      {filteredMenuItems.map((item) => (
        <li key={item.label}>
          {item.children ? (
            <div>
              <button
                onClick={() => toggleExpanded(item.label)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive(item.href, false)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <span className={cn(
                  'flex-shrink-0',
                  isActive(item.href, false) ? 'text-blue-600' : 'text-gray-400'
                )}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        expandedMenus.includes(item.label) && 'rotate-180'
                      )}
                    />
                  </>
                )}
              </button>
              {!collapsed && expandedMenus.includes(item.label) && (
                <ul className="mt-1 ml-8 space-y-1">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-sm transition-colors',
                          pathname === child.href
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <Link
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.href, item.href === '/dashboard')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className={cn(
                'flex-shrink-0',
                isActive(item.href, item.href === '/dashboard') ? 'text-blue-600' : 'text-gray-400'
              )}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="mr-3"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">TVRI Nobar</span>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'lg:hidden fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">TVRI Nobar</h1>
                <p className="text-xs text-gray-500">Merchant Licensing Portal</p>
              </div>
            </div>
          </div>
          {/* User Info */}
          {session?.user && (
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 truncate">{session.user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="h-7 px-2 text-gray-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Login terakhir: {formatLastLogin(userData?.lastLoginAt || null)}
              </p>
            </div>
          )}
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-2">
            {renderMenu()}
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden lg:block fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-30 transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              {!collapsed && (
                <div>
                  <h1 className="font-bold text-gray-900">TVRI Nobar</h1>
                  <p className="text-xs text-gray-500">Merchant Licensing Portal</p>
                </div>
              )}
            </div>
          </div>
          {/* User Info */}
          {session?.user && !collapsed && (
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 truncate">{session.user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="h-7 px-2 text-gray-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Login terakhir: {formatLastLogin(userData?.lastLoginAt || null)}
              </p>
            </div>
          )}
          {collapsed && session?.user && (
            <div className="p-2 border-b border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full justify-center text-gray-500 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
          {/* Search */}
          {!collapsed && (
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-2">
            {renderMenu()}
          </nav>
          {/* Collapse Button */}
          <div className="p-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full justify-center"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300 pt-14 lg:pt-0',
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
