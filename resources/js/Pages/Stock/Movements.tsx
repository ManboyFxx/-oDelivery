import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { History, ArrowLeft, ArrowUpCircle, ArrowDownCircle, AlertCircle, Package, User, Clock, ShoppingBag } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Movement {
    id: string;
    product: {
        name: string;
    };
    quantity: number;
    type: 'purchase' | 'sale' | 'adjustment' | 'loss' | 'return';
    reason: string | null;
    order?: {
        order_number: string;
    } | null;
    creator?: {
        name: string;
    };
    created_at: string;
}

interface Props {
    movements: {
        data: Movement[];
        links: any[];
    };
}

export default function StockMovements({ movements }: Props) {
    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'purchase':
                return {
                    label: 'Entrada',
                    icon: <ArrowUpCircle className="w-4 h-4 text-green-500" />,
                    bg: 'bg-green-50 dark:bg-green-500/10',
                    text: 'text-green-700 dark:text-green-400'
                };
            case 'sale':
                return {
                    label: 'Venda',
                    icon: <ShoppingBag className="w-4 h-4 text-blue-500" />,
                    bg: 'bg-blue-50 dark:bg-blue-500/10',
                    text: 'text-blue-700 dark:text-blue-400'
                };
            case 'adjustment':
                return {
                    label: 'Ajuste',
                    icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
                    bg: 'bg-orange-50 dark:bg-orange-500/10',
                    text: 'text-orange-700 dark:text-orange-400'
                };
            default:
                return {
                    label: type,
                    icon: <Clock className="w-4 h-4 text-gray-500" />,
                    bg: 'bg-gray-50 dark:bg-white/5',
                    text: 'text-gray-700 dark:text-gray-400'
                };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Histórico de Estoque" />

            <div className="flex h-full flex-col space-y-8">
                {/* Header */}
                <PageHeader
                    title="Histórico de Estoque"
                    subtitle="Acompanhe todas as entradas e saídas de produtos."
                    action={
                        <Link
                            href={route('stock.index')}
                            className="flex items-center gap-2 rounded-2xl bg-white dark:bg-[#1a1b1e] border border-gray-200 dark:border-white/10 px-4 py-3 text-sm font-bold text-gray-700 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Voltar
                        </Link>
                    }
                />

                {/* Movements Table/List */}
                <div className="bg-white dark:bg-[#1a1b1e] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 dark:border-white/5">
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Data/Hora</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Produto</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Quantidade</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Motivo</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Operador</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {movements.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Nenhuma movimentação encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    movements.data.map((movement) => {
                                        const config = getTypeConfig(movement.type);
                                        return (
                                            <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                            {format(new Date(movement.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {format(new Date(movement.created_at), 'HH:mm')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                                                            <Package className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                                                            {movement.product.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${config.bg} ${config.text}`}>
                                                        {config.icon}
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-sm font-black ${movement.type === 'purchase' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {movement.type === 'purchase' ? '+' : '-'}{movement.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {movement.reason || '-'}
                                                        </span>
                                                        {movement.order && (
                                                            <span className="text-xs text-[#ff3d03] font-bold">
                                                                Pedido #{movement.order.order_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center">
                                                            <User className="w-3 h-3 text-gray-500" />
                                                        </div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {movement.creator?.name || 'Sistema'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Simple Pagination Placeholder */}
                    {movements.links && movements.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-50 dark:border-white/5 flex justify-center gap-2">
                            {movements.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${link.active
                                            ? 'bg-[#ff3d03] text-white shadow-lg shadow-[#ff3d03]/20'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
