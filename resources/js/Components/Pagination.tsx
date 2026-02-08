import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
}

export default function Pagination({ links }: PaginationProps) {
    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <div className="flex items-center justify-center gap-1">
            {links.map((link, index) => {
                // Skip if no URL
                if (!link.url) {
                    return (
                        <span
                            key={index}
                            className="px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                // Active page
                if (link.active) {
                    return (
                        <span
                            key={index}
                            className="px-4 py-2 text-sm font-bold bg-[#ff3d03] text-white rounded-lg"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                // Regular link
                return (
                    <Link
                        key={index}
                        href={link.url}
                        className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveScroll
                    />
                );
            })}
        </div>
    );
}
