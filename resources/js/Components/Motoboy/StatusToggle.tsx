import { useState } from 'react';
import { Power } from 'lucide-react';
import axios from 'axios';

interface StatusToggleProps {
    isOnline: boolean;
    status: string;
    onToggle: (newStatus: boolean) => void;
    disabled?: boolean;
}

export default function StatusToggle({ isOnline, status, onToggle, disabled = false }: StatusToggleProps) {
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('motoboy.availability.toggle'));
            if (response.data.success) {
                onToggle(response.data.is_online);
            }
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        } finally {
            setLoading(false);
        }
    };

    const statusColor = isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
    const statusLabel = isOnline ? 'ONLINE' : 'OFFLINE';
    const statusDot = isOnline ? 'bg-green-500' : 'bg-gray-400';

    return (
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all ${
            isOnline ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
        }`}>
            <button
                onClick={handleToggle}
                disabled={disabled || loading}
                className={`
                    flex items-center justify-center w-14 h-14 rounded-full
                    transition-all transform
                    ${isOnline
                        ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30'
                        : 'bg-gray-400 hover:bg-gray-500 shadow-lg shadow-gray-500/30'
                    }
                    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    active:scale-95
                `}
                title={isOnline ? 'Ir Offline' : 'Ir Online'}
            >
                <Power className={`w-6 h-6 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex-1">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Status</p>
                <div className="flex items-center gap-3 mt-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${statusDot}`}></div>
                    <p className={`text-lg font-black ${statusColor} px-3 py-1 rounded-full`}>
                        {statusLabel}
                    </p>
                </div>
            </div>

            {loading && (
                <div className="text-xs text-gray-500 font-medium">Atualizando...</div>
            )}
        </div>
    );
}
