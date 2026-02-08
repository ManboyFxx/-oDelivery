import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Package, TrendingDown, RefreshCw } from 'lucide-react';

interface Ingredient {
    id: string;
    name: string;
    stock: number;
    min_stock: number;
    is_available: boolean;
}

interface Props {
    lowStockIngredients: Ingredient[];
}

export default function Alerts({ lowStockIngredients }: Props) {
    const getStockPercentage = (ingredient: Ingredient) => {
        if (!ingredient.min_stock || ingredient.min_stock === 0) return 100;
        return (ingredient.stock / ingredient.min_stock) * 100;
    };

    const getStockStatus = (percentage: number) => {
        if (percentage <= 0) return { label: 'Esgotado', color: 'text-red-600 bg-red-50 border-red-200' };
        if (percentage <= 50) return { label: 'Crítico', color: 'text-orange-600 bg-orange-50 border-orange-200' };
        return { label: 'Baixo', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    };

    return (
        <AuthenticatedLayout>
            <Head title="Alertas de Estoque" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                                    Alertas de Estoque Baixo
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Ingredientes que precisam de reposição
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 mb-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total de Alertas</p>
                                <p className="text-4xl font-black text-gray-900 dark:text-white">
                                    {lowStockIngredients.length}
                                </p>
                            </div>
                            <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
                                <TrendingDown className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </div>

                    {/* Alerts List */}
                    {lowStockIngredients.length === 0 ? (
                        <div className="bg-white dark:bg-[#1a1b1e] rounded-2xl border border-gray-200 dark:border-white/10 p-12 text-center shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                                <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Tudo certo! 🎉
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Nenhum ingrediente com estoque baixo no momento.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {lowStockIngredients.map((ingredient) => {
                                const percentage = getStockPercentage(ingredient);
                                const status = getStockStatus(percentage);

                                return (
                                    <div
                                        key={ingredient.id}
                                        className="bg-white dark:bg-[#1a1b1e] rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                                                        <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {ingredient.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Estoque atual: <span className="font-semibold">{ingredient.stock}</span> |
                                                            Mínimo: <span className="font-semibold">{ingredient.min_stock}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                            Nível de Estoque
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                            {percentage.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all ${percentage <= 0 ? 'bg-red-500' :
                                                                    percentage <= 50 ? 'bg-orange-500' :
                                                                        'bg-yellow-500'
                                                                }`}
                                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="ml-6">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border ${status.color}`}>
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {status.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                            <a
                                                href={`/ingredients/${ingredient.id}/edit`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff3d03] hover:bg-[#e63700] text-white rounded-xl font-medium text-sm transition-colors"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                                Dar Entrada no Estoque
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
