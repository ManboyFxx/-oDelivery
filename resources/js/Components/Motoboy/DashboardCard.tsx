import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subtitle?: string;
    trend?: 'up' | 'down' | null;
    trendValue?: string;
    color?: 'orange' | 'blue' | 'purple' | 'green' | 'yellow' | 'red';
}

export default function DashboardCard({
    icon: Icon,
    label,
    value,
    subtitle,
    trend,
    trendValue,
    color = 'orange',
}: DashboardCardProps) {
    const colorMap = {
        orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200' },
        blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
        purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
        green: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-green-200' },
        yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-200' },
        red: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-200' },
    };

    const colors = colorMap[color];

    return (
        <div className={`${colors.bg} rounded-2xl border-2 ${colors.border} p-6 hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                {trend && (
                    <div
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </div>
                )}
            </div>

            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-gray-900 mt-2">{value}</p>

            {subtitle && <p className="text-xs text-gray-600 font-medium mt-2">{subtitle}</p>}
        </div>
    );
}
