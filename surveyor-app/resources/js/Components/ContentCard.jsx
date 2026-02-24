import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

export default function ContentCard({ 
    title, 
    subtitle, 
    children, 
    emptyIcon: EmptyIcon,
    emptyText,
    emptyAction,
    emptyActionText,
    viewAllHref = '#',
    viewAllText = 'Lihat semua'
}) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className={`rounded-xl overflow-hidden
            ${isDark ? 'bg-[#0d1414] border border-emerald-900/30' : 'bg-white border border-gray-200'}
        `}>
            <div className={`flex items-center justify-between px-5 py-4 border-b
                ${isDark ? 'border-emerald-900/30' : 'border-gray-100'}
            `}>
                <div>
                    <h3 className={`font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{title}</h3>
                    {subtitle && <p className={`text-sm mt-0.5 ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{subtitle}</p>}
                </div>
                <Link 
                    href={viewAllHref}
                    className={`text-sm font-medium flex items-center gap-1
                        ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}
                    `}
                >
                    {viewAllText}
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="p-5">
                {children ? (
                    children
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                        {EmptyIcon && (
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3
                                ${isDark ? 'bg-emerald-500/10 ring-1 ring-emerald-500/20' : 'bg-gray-100'}
                            `}>
                                <EmptyIcon className={`w-6 h-6 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
                            </div>
                        )}
                        <p className={`text-sm ${isDark ? 'text-emerald-500/60' : 'text-gray-500'}`}>{emptyText}</p>
                        {emptyAction && (
                            <Link 
                                href={emptyAction}
                                className={`mt-2 text-sm font-medium flex items-center gap-1
                                    ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-teal-600 hover:text-teal-700'}
                                `}
                            >
                                {emptyActionText}
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
