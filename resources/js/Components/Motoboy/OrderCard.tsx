import { Link } from '@inertiajs/react';
import { Clock, MapPin, DollarSign, User, Phone } from 'lucide-react';

interface OrderCardProps {
    orderId: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    total: number;
    deliveryFee: number;
    itemsCount: number;
    estimatedTimeMinutes: number;
    createdAt?: string;
    showActions?: boolean;
    onAccept?: (orderId: string) => void;
    loading?: boolean;
}

export default function OrderCard({
    orderId,
    orderNumber,
    customerName,
    customerPhone,
    deliveryAddress,
    total,
    deliveryFee,
    itemsCount,
    estimatedTimeMinutes,
    createdAt,
    showActions = true,
    onAccept,
    loading = false,
}: OrderCardProps) {
    const handleAccept = (e: React.MouseEvent) => {
        e.preventDefault();
        onAccept?.(orderId);
    };

    return (
        <Link href={route('motoboy.orders.show', orderId)}>
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-[#ff3d03] hover:shadow-md transition-all cursor-pointer h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Pedido</p>
                        <p className="text-lg font-black text-gray-900">#{orderNumber}</p>
                    </div>
                    {createdAt && (
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {createdAt}
                        </span>
                    )}
                </div>

                {/* Cliente */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-[#ff3d03]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{customerName}</p>
                            <a
                                href={`tel:${customerPhone}`}
                                onClick={(e) => e.preventDefault()}
                                className="text-xs text-[#ff3d03] font-medium flex items-center gap-1 hover:underline"
                            >
                                <Phone className="w-3 h-3" />
                                {customerPhone}
                            </a>
                        </div>
                    </div>
                </div>

                {/* Endereço */}
                <div className="mb-4 flex gap-3">
                    <MapPin className="w-5 h-5 text-[#ff3d03] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Entrega</p>
                        <p className="text-sm font-medium text-gray-700 line-clamp-2">{deliveryAddress}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-blue-600 font-bold">Itens</p>
                        <p className="text-lg font-black text-blue-700">{itemsCount}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-green-600 font-bold">Tempo</p>
                        <p className="text-lg font-black text-green-700 flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" />
                            {estimatedTimeMinutes}m
                        </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-purple-600 font-bold">Taxa</p>
                        <p className="text-lg font-black text-purple-700 flex items-center justify-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            R${deliveryFee}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-600 font-medium">Total do Pedido</p>
                        <p className="text-xl font-black text-gray-900">R$ {total.toFixed(2)}</p>
                    </div>
                    {showActions && (
                        <button
                            onClick={handleAccept}
                            disabled={loading}
                            className={`
                                px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-widest
                                transition-all
                                ${loading
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#ff3d03] text-white hover:bg-[#e63700] active:scale-95'
                                }
                            `}
                        >
                            {loading ? '...' : 'Aceitar'}
                        </button>
                    )}
                </div>
            </div>
        </Link>
    );
}
