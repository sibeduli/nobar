import { useTheme } from '@/Contexts/ThemeContext';

export default function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const defaultIconBg = isDark ? 'bg-emerald-500/20' : 'bg-teal-50';
    const defaultIconColor = isDark ? 'text-emerald-400' : 'text-teal-600';

    return (
        <div className={`rounded-xl p-5 transition-all group
            ${isDark 
                ? 'bg-[#0d1414] border border-emerald-900/30 hover:border-emerald-500/40' 
                : 'bg-white border border-gray-200 hover:shadow-md'
            }
        `}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-500/70' : 'text-gray-500'}`}>{title}</p>
                    <p className={`mt-2 text-2xl font-semibold ${isDark ? 'text-emerald-50' : 'text-gray-900'}`}>{value}</p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>{subtitle}</p>
                </div>
                {Icon && (
                    <div className={`w-10 h-10 ${iconBg || defaultIconBg} rounded-lg flex items-center justify-center transition-all
                        ${isDark ? 'ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40' : ''}
                    `}>
                        <Icon className={`w-5 h-5 ${iconColor || defaultIconColor}`} />
                    </div>
                )}
            </div>
        </div>
    );
}
