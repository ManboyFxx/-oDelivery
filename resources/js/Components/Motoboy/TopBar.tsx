import { MapPin } from 'lucide-react';
import UserMenu from './UserMenu';
import NotificationBell from './NotificationBell';

interface TopBarProps {
    title: string;
    subtitle?: string;
    user: {
        name: string;
        email: string;
        avatar_url?: string;
    };
}

export default function TopBar({ title, subtitle, user }: TopBarProps) {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <div>
                        <h1 className="text-xl font-black text-gray-900">{title}</h1>
                        {subtitle && <p className="text-sm text-gray-600 font-medium">{subtitle}</p>}
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
                {/* Location Status */}
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
                    <MapPin className="w-4 h-4 text-[#ff3d03]" />
                    <span className="text-xs font-bold text-[#ff3d03] uppercase tracking-widest">Offline</span>
                </div>

                {/* Notifications - Dynamic with Bell and Badge */}
                <NotificationBell />

                {/* User Menu */}
                <UserMenu user={user} />
            </div>
        </header>
    );
}
