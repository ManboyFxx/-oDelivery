import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { Search, Shield, Filter, Lock, Save, X } from 'lucide-react';
import { useState, FormEventHandler } from 'react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    tenant?: {
        name: string;
        slug: string;
    };
    created_at: string;
}

interface IndexProps {
    users: {
        data: User[];
        links: any[];
    };
    filters: {
        search?: string;
    };
}

export default function AdminUsersIndex({ users, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    // Form for password reset
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            router.get(route('admin.users.index'), { search }, { preserveState: true });
        }
    };

    const openResetModal = (user: User) => {
        setSelectedUser(user);
        reset();
        clearErrors();
        setIsResetModalOpen(true);
    };

    const closeResetModal = () => {
        setIsResetModalOpen(false);
        setSelectedUser(null);
        reset();
    };

    const submitReset: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        put(route('admin.users.reset-password', selectedUser.id), {
            onSuccess: () => {
                closeResetModal();
                // Optional: show toast/notification
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gerenciar Usuários" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Usuários Globais</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Controle de acesso de todas as lojas</p>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar nome, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#1a1b1e] border border-gray-100 dark:border-white/5 text-sm focus:ring-2 focus:ring-[#ff3d03]/20 shadow-sm"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm p-8">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5">
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase">Usuário</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase">Loja</th>
                                    <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase">Função</th>
                                    <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            {user.tenant ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                                        {user.tenant.slug.substring(0, 1).toUpperCase()}
                                                    </span>
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{user.tenant.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Sem Loja (Admin?)</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                                                    user.role === 'motoboy' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() => openResetModal(user)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-colors"
                                            >
                                                <Lock className="w-3 h-3" />
                                                Redefinir Senha
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Reset Password Modal */}
            <Modal show={isResetModalOpen} onClose={closeResetModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        Redefinir Senha de {selectedUser?.name}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Isso alterará a senha do usuário imediatamente. Certifique-se de comunicar a nova senha ao usuário.
                    </p>

                    <form onSubmit={submitReset} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="password" value="Nova Senha" />
                            <TextInput
                                id="password"
                                type="text" // Visible for admin convenience, or use password type
                                className="mt-1 block w-full"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                placeholder="Digite a nova senha"
                                isFocused
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirmar Nova Senha" />
                            <TextInput
                                id="password_confirmation"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                placeholder="Confirme a senha"
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <SecondaryButton onClick={closeResetModal}>Cancelar</SecondaryButton>
                            <PrimaryButton disabled={processing}>
                                Salvar Nova Senha
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
