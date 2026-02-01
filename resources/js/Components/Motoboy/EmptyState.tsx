import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-12">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gray-400" />
                </div>
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 font-medium mb-6 max-w-sm mx-auto">{description}</p>

            {action && (
                <button
                    onClick={action.onClick}
                    href={action.href}
                    className="px-6 py-2 bg-[#ff3d03] text-white font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#e63700] transition-all"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
