import clsx from 'clsx';
import { useEffect, useRef } from 'react';

interface Category {
    id: string;
    name: string;
}

interface CategoryNavProps {
    categories: Category[];
    activeCategory: string;
    onSelectCategory: (id: string) => void;
}

export default function CategoryNav({ categories, activeCategory, onSelectCategory }: CategoryNavProps) {
    const navRef = useRef<HTMLDivElement>(null);

    // Scroll active category into view
    useEffect(() => {
        if (activeCategory && navRef.current) {
            const activeEl = document.getElementById(`nav-item-${activeCategory}`);
            if (activeEl) {
                const navRect = navRef.current.getBoundingClientRect();
                const activeRect = activeEl.getBoundingClientRect();

                // Calculate center position
                const scrollLeft = activeEl.offsetLeft - (navRect.width / 2) + (activeRect.width / 2);

                navRef.current.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeCategory]);

    return (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-2">
            <div className="max-w-7xl mx-auto px-4">
                <div
                    ref={navRef}
                    className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1"
                >
                    <button
                        id="nav-item-all"
                        onClick={() => onSelectCategory('all')}
                        className={clsx(
                            "group relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap overflow-hidden",
                            activeCategory === 'all'
                                ? "bg-[#ff3d03] text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-200 ring-offset-1 scale-105"
                                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        )}
                    >
                        {/* Shimmer Effect for Active State */}
                        {activeCategory === 'all' && (
                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        )}
                        Todos
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category.id}
                            id={`nav-item-${category.id}`}
                            onClick={() => onSelectCategory(category.id)}
                            className={clsx(
                                "group relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap overflow-hidden",
                                activeCategory === category.id
                                    ? "bg-[#ff3d03] text-white shadow-lg shadow-orange-500/30 ring-2 ring-orange-200 ring-offset-1 scale-105"
                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            {/* Shimmer Effect for Active State */}
                            {activeCategory === category.id && (
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            )}
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
