import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface Customer {
    id: string;
    name: string;
    phone: string;
    loyalty_points: number;
    loyalty_tier?: string;
}

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (customer: Customer) => void;
    slug: string;
}

export default function AuthModal({ isOpen, onClose, onLogin, slug }: AuthModalProps) {
    if (!isOpen) return null;

    const [authStep, setAuthStep] = useState<'phone' | 'name'>('phone');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize Device Fingerprint
    useEffect(() => {
        if (!localStorage.getItem('device_fingerprint')) {
            const fingerprint = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : 'device-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('device_fingerprint', fingerprint);
        }
    }, []);

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/customer/check-phone', {
                phone,
                tenant_slug: slug,
                device_fingerprint: localStorage.getItem('device_fingerprint') || 'unknown-device'
            });
            if (response.data.exists) {
                onLogin(response.data.customer);
                onClose();
                setPhone('');
                toast.success(`Bem-vindo de volta, ${response.data.customer.name}!`);
            } else {
                setAuthStep('name');
            }
        } catch (error) {
            console.error('Error checking phone:', error);
            toast.error('Erro ao verificar telefone. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/customer/complete-registration', {
                phone,
                name,
                tenant_slug: slug
            });
            onLogin(response.data.customer);
            onClose();
            setPhone('');
            setName('');
            setAuthStep('phone');
            toast.success(`Cadastro realizado com sucesso!`);
        } catch (error: any) {
            console.error('Error completing registration:', error);
            const msg = error.response?.data?.message || 'Erro ao completar cadastro.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white rounded-2xl p-6 max-w-md w-full relative z-10 shadow-xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        {authStep === 'phone' ? 'Entrar ou Cadastrar' : 'Complete seu Cadastro'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {authStep === 'phone' ? (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Telefone
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(00) 00000-0000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : 'Continuar'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleNameSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Seu Nome
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Digite seu nome"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
