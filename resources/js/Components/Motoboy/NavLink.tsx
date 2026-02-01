import { Link } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

interface NavLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    active?: boolean;
    collapsed?: boolean;
}

export default function NavLink({ href, icon: Icon, label, active = false, collapsed = false }: NavLinkProps) {
    return (
        <Link
            href={href}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 font-medium text-sm
                ${active
                    ? 'bg-[#ff3d03]/10 text-[#ff3d03] border-l-4 border-[#ff3d03]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
            `}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}
