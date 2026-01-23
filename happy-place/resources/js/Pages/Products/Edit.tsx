import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react'; // Add router
import { FormEventHandler, useState } from 'react'; // Add useState

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: string;
    category_id: string;
    image_url?: string;
}

interface Group {
    id: string;
    name: string;
    min_selections: number;
    max_selections: number;
}

export default function Edit({ product, categories, complement_groups = [] }: { product: any, categories: Category[], complement_groups: Group[] }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH', // Spoof PATCH for file upload support in Laravel
        name: product.name,
        price: product.price,
        description: product.description || '',
        category_id: product.category_id || '',
        complement_groups: product.complement_groups ? product.complement_groups.map((g: any) => g.id) : [] as string[],
        image: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(product.image_url || null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Inertia doesn't support file uploads with PUT/PATCH directly, so we use POST with _method
        post(route('products.update', product.id));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Editar ${product.name}`} />

            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Produto</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Atualize as informações do produto abaixo.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">Foto do Produto</label>
                        <div className="mt-2 flex items-center gap-x-3">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover bg-gray-100" />
                            ) : (
                                <div className="h-24 w-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                    Sem foto
                                </div>
                            )}
                            <label
                                htmlFor="image-upload"
                                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                Alterar
                                <input
                                    id="image-upload"
                                    name="image"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                />
                            </label>
                        </div>
                        {errors.image && <p className="mt-2 text-sm text-red-600">{errors.image}</p>}
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                            Nome do Produto
                        </label>
                        <div className="mt-2">
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </div>
                    </div>

                    {/* Price & Category Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                                Preço (R$)
                            </label>
                            <div className="mt-2">
                                <input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                                />
                                {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="category" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                                Categoria
                            </label>
                            <div className="mt-2">
                                <select
                                    id="category"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                                >
                                    <option value="">Selecione...</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="mt-2 text-sm text-red-600">{errors.category_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100">
                            Descrição
                        </label>
                        <div className="mt-2">
                            <textarea
                                id="description"
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                            />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-400">Uma breve descrição do prato ou bebida.</p>
                    </div>

                    {/* Complement Groups */}
                    <div>
                        <span className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-100 mb-2">
                            Grupos de Complementos
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {complement_groups.map((group) => (
                                <div key={group.id} className="relative flex items-start">
                                    <div className="flex h-6 items-center">
                                        <input
                                            id={`param-${group.id}`}
                                            name={`complement_groups[]`}
                                            type="checkbox"
                                            value={group.id}
                                            checked={data.complement_groups.includes(group.id)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                if (checked) {
                                                    setData('complement_groups', [...data.complement_groups, group.id]);
                                                } else {
                                                    setData('complement_groups', data.complement_groups.filter((id: string) => id !== group.id));
                                                }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 dark:border-gray-700 dark:bg-gray-800"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                        <label htmlFor={`param-${group.id}`} className="font-medium text-gray-900 dark:text-gray-100">
                                            {group.name}
                                        </label>
                                        <p className="text-gray-500 dark:text-gray-400">{group.min_selections} a {group.max_selections} opções</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-x-6 border-t border-gray-900/10 pt-6 dark:border-gray-700">
                        <Link href={route('products.index')} className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
