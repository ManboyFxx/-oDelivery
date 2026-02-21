// VIBRANTE - Atualizado em 2026-02-17 22:53
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
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-premium-dark/95 backdrop-blur-xl border-b border-gray-100/80 dark:border-white/5 shadow-sm py-2 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4">
                <div
                    ref={navRef}
                    className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide py-1"
                >
                    <button
                        id="nav-item-all"
                        onClick={() => onSelectCategory('all')}
                        className={clsx(
                            "group relative px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap overflow-hidden shadow-sm",
                            activeCategory === 'all'
                                ? "text-white shadow-md shadow-primary/20 scale-105"
                                : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 dark:hover:text-gray-200"
                        )}
                        style={activeCategory === 'all' ? { background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)' } : {}}
                    >
                        Todos
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category.id}
                            id={`nav-item-${category.id}`}
                            onClick={() => onSelectCategory(category.id)}
                            className={clsx(
                                "group relative px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap overflow-hidden shadow-sm",
                                activeCategory === category.id
                                    ? "text-white shadow-md shadow-primary/20 scale-105"
                                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 dark:hover:text-gray-200"
                            )}
                            style={activeCategory === category.id ? { background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)' } : {}}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
