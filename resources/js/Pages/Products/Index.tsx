import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import PageHeader from '@/Components/PageHeader';
import ProductsTab from './Tabs/ProductsTab';
import CategoriesTab from './Tabs/CategoriesTab';
import ComplementsTab from './Tabs/ComplementsTab';
import IngredientsTab from './Tabs/IngredientsTab';
import { useFlashToast } from '@/Hooks/useFlashToast';

interface Props {
    products: any;
    categories: any[];
    complement_groups: any[];
    ingredients: any[];
    usage: any;
}

export default function ProductsIndex({ products, categories, complement_groups, ingredients, usage }: Props) {
    // Auto-display flash toast messages
    useFlashToast();

    // Get active tab from URL query param or default to 'products'
    const queryParams = new URLSearchParams(window.location.search);
    const initialTab = queryParams.get('tab') || 'products';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Update URL without reloading when tab changes
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gerenciar Cardápio" />

            <div className="flex h-full flex-col space-y-8">
                {/* Page Header */}
                <PageHeader
                    title="Catálogo & Cardápio"
                    subtitle="Gerencie seus produtos, categorias e complementos em um só lugar."
                />

                {/* Tabs Navigation */}
                <div className="flex justify-center md:justify-start">
                    <nav className="flex items-center gap-1 bg-white dark:bg-[#1a1b1e] p-1.5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-x-auto max-w-full">
                        <button
                            onClick={() => handleTabChange('products')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'products'
                                ? 'bg-[#ff3d03] text-white shadow-md shadow-[#ff3d03]/20'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            Produtos
                        </button>
                        <button
                            onClick={() => handleTabChange('ingredients')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ingredients'
                                ? 'bg-[#ff3d03] text-white shadow-md shadow-[#ff3d03]/20'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            Ingredientes
                        </button>
                        <button
                            onClick={() => handleTabChange('categories')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'categories'
                                ? 'bg-[#ff3d03] text-white shadow-md shadow-[#ff3d03]/20'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            Categorias
                        </button>
                        <button
                            onClick={() => handleTabChange('complements')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'complements'
                                ? 'bg-[#ff3d03] text-white shadow-md shadow-[#ff3d03]/20'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}
                        >
                            Complementos
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0">
                    {activeTab === 'products' && (
                        <ProductsTab
                            products={products}
                            categories={categories}
                            complement_groups={complement_groups}
                            usage={usage}
                        />
                    )}
                    {activeTab === 'categories' && (
                        <CategoriesTab categories={categories} />
                    )}
                    {activeTab === 'complements' && (
                        <ComplementsTab groups={complement_groups} ingredients={ingredients} />
                    )}
                    {activeTab === 'ingredients' && (
                        <IngredientsTab ingredients={ingredients} />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
