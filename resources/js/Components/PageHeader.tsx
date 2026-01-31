import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    children?: ReactNode;
}

export default function PageHeader({ title, subtitle, action, children }: PageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>
            {(action || children) && (
                <div className="flex items-center gap-3">
                    {action}
                    {children}
                </div>
            )}
        </div>
    );
}
