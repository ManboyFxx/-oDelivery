import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BookOpen, GripVertical, Eye, EyeOff } from 'lucide-react';

interface Category {
    id: string;
    name: string;
    products_count: number;
    is_visible?: boolean;
}

export default function MenuIndex({ categories }: { categories: Category[] }) {
    return (
        <AuthenticatedLayout>
            <Head title="Cardápio Digital" />

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
                    Organizar Cardápio
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Defina a ordem das categorias e quais grupos aparecem no cardápio público.
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {categories.map((category) => (
                        <li key={category.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                                    <GripVertical className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {category.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {category.products_count} produtos
                                    </p>
                                </div>
                            </div>

                            <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                                <Eye className="h-5 w-5" />
                                {/* Logic to toggle Eye/EyeOff */}
                            </button>
                        </li>
                    ))}
                    {categories.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            Nenhuma categoria encontrada. Cadastre produtos primeiro.
                        </div>
                    )}
                </ul>
            </div>

            <div className="mt-6 flex justify-end">
                <a
                    href="/demo/menu"
                    target="_blank"
                    className="flex items-center gap-2 text-[var(--color-primary)] font-bold hover:underline"
                >
                    Visualizar Cardápio Público <BookOpen className="h-4 w-4" />
                </a>
            </div>
        </AuthenticatedLayout>
    );
}
