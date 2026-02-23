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
    isOnline?: boolean;
}

export default function TopBar({ title, subtitle, user, isOnline = false }: TopBarProps) {
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
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    isOnline 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}>
                    <MapPin className={`w-4 h-4 ${isOnline ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-xs font-bold uppercase tracking-widest">
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>

                {/* Notifications - Dynamic with Bell and Badge */}
                <NotificationBell />

                {/* User Menu */}
                <UserMenu user={user} />
            </div>
        </header>
    );
}
