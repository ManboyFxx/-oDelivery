import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import PageHeader from '@/Components/PageHeader';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'admin' | 'employee' | 'motoboy';
    is_active: boolean;
    is_available: boolean;
    avatar_url?: string;
    is_current_user: boolean;
}

interface Props {
    employees: Employee[];
    current_user_id: string;
    can_create_motoboy: boolean;
}

const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    employee: 'Funcionário',
    motoboy: 'Motoboy',
};

const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    employee: 'bg-blue-100 text-blue-700',
    motoboy: 'bg-green-100 text-green-700',
};

export default function EmployeesIndex({ employees, current_user_id, can_create_motoboy }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'employee' as Employee['role'],
        password: '',
        password_confirmation: '',
    });

    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'employee' as Employee['role'],
        is_active: true,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('employees.store'), formData, {
            onSuccess: () => {
                setShowCreateModal(false);
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'employee',
                    password: '',
                    password_confirmation: '',
                });
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;

        router.put(route('employees.update', { employee: editingEmployee.id }), editFormData, {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingEmployee(null);
            },
        });
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
        setEditFormData({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            role: employee.role,
            is_active: employee.is_active,
        });
        setShowEditModal(true);
    };

    const handleDelete = (id: string) => {
        router.delete(route('employees.destroy', { employee: id }));
        setDeleteConfirm(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gerenciar Funcionários" />

            <div className="flex h-full flex-col space-y-8">
                {/* Page Header */}
                <PageHeader
                    title="Funcionários"
                    subtitle="Gerencie seus funcionários, admins e motoboys."
                />

                {/* Header with Create Button */}
                <div className="flex justify-between items-center">
                    <div></div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-[#ff3d03] hover:bg-[#e63700] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-[#ff3d03]/20 hover:shadow-lg hover:shadow-[#ff3d03]/30"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Funcionário
                    </button>
                </div>

                {/* Employees Table */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Nome</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Telefone</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Cargo</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">Status</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Nenhum funcionário cadastrado. Clique em "Novo Funcionário" para adicionar.
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className={`border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${employee.is_current_user ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                                                }`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff3d03] to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {employee.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">
                                                            {employee.name}
                                                            {employee.is_current_user && (
                                                                <span className="ml-2 text-xs bg-[#ff3d03] text-white px-2 py-1 rounded-full">Você</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{employee.email}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{employee.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${roleColors[employee.role]}`}>
                                                    {roleLabels[employee.role]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {employee.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                        <Check className="w-4 h-4" /> Ativo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                                        <X className="w-4 h-4" /> Inativo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(employee)}
                                                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    {/* Prevent self-deletion */}
                                                    {!employee.is_current_user && (
                                                        <button
                                                            onClick={() => setDeleteConfirm(employee.id)}
                                                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                                            title="Remover"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {employee.is_current_user && (
                                                        <div className="p-2 opacity-30 cursor-not-allowed" title="Você não pode se remover">
                                                            <Trash2 className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-[#1a1b1e] border-b border-gray-200 dark:border-white/5 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novo Funcionário</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Nome *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03]"
                                    placeholder="Nome completo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03]"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Telefone *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03]"
                                    placeholder="(11) 99999-9999"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Cargo *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03] [&>option]:bg-white [&>option]:dark:bg-[#1a1b1e] [&>option]:text-gray-900 [&>option]:dark:text-white"
                                    required
                                >
                                    <option value="employee" className="bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white">Funcionário</option>
                                    <option value="admin" className="bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white">Administrador</option>
                                    <option
                                        value="motoboy"
                                        className="bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white disabled:text-gray-400"
                                        disabled={!can_create_motoboy}
                                    >
                                        Motoboy {!can_create_motoboy && '(Upgrade Necessário)'}
                                    </option>
                                </select>
                                {!can_create_motoboy && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Para cadastrar motoboys, seu plano precisa ter o recurso habilitado.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Senha *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03]"
                                    placeholder="Mínimo 8 caracteres"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Confirmar Senha *</label>
                                <input
                                    type="password"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03]"
                                    placeholder="Confirme a senha"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold transition-colors"
                                >
                                    Criar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingEmployee && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-[#1a1b1e] border-b border-gray-200 dark:border-white/5 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Funcionário</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingEmployee(null);
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Nome *</label>
                                <input
                                    type="text"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03]"
                                    placeholder="Nome completo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Email *</label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03]"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Telefone *</label>
                                <input
                                    type="tel"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03]"
                                    placeholder="(11) 99999-9999"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Cargo *</label>
                                <select
                                    value={editFormData.role}
                                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff3d03] [&>option]:bg-white [&>option]:dark:bg-[#1a1b1e] [&>option]:text-gray-900 [&>option]:dark:text-white"
                                    required
                                >
                                    <option value="employee" className="bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white">Funcionário</option>
                                    <option value="admin" className="bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white">Administrador</option>
                                    <option
                                        value="motoboy"
                                        className="bg-white dark:bg-[#1a1b1e] text-gray-900 dark:text-white disabled:text-gray-400"
                                        disabled={!can_create_motoboy}
                                    >
                                        Motoboy {!can_create_motoboy && '(Upgrade Necessário)'}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editFormData.is_active}
                                        onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-200 dark:border-white/10 text-[#ff3d03] focus:ring-[#ff3d03]"
                                    />
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">Funcionário Ativo</span>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingEmployee(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold transition-colors"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#1a1b1e] rounded-2xl max-w-sm w-full">
                        <div className="p-6 space-y-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Remover Funcionário</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Tem certeza que deseja remover este funcionário? Esta ação não pode ser desfeita.
                            </p>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                                >
                                    Remover
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
