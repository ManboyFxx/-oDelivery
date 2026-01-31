import { Head, Link } from '@inertiajs/react';
import { ShieldX, Mail, Phone } from 'lucide-react';

interface Props {
    tenant: {
        name: string;
        suspension_reason: string | null;
        suspended_at: string | null;
    };
}

export default function Suspended({ tenant }: Props) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Head title="Conta Suspensa - ÓoDelivery" />

            <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
                {/* Logo */}
                <Link href="/" className="mb-8">
                    <img src="/images/logo-full.png" alt="ÓoDelivery" className="h-16" />
                </Link>

                {/* Icon */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldX className="w-10 h-10 text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-gray-900 text-center mb-3">
                    Conta Suspensa
                </h1>
                <p className="text-gray-500 text-center max-w-md mb-6">
                    Sua conta foi temporariamente suspensa.
                </p>

                {/* Reason */}
                {tenant.suspension_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 max-w-md w-full">
                        <p className="text-sm font-medium text-red-800 mb-1">Motivo:</p>
                        <p className="text-sm text-red-700">{tenant.suspension_reason}</p>
                    </div>
                )}

                {/* What to do */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full mb-8">
                    <h2 className="font-bold text-gray-900 mb-4">O que fazer agora?</h2>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Entre em contato com nosso suporte para resolver esta situação.
                            Seus dados estão seguros e podemos ajudá-lo a reativar sua conta.
                        </p>

                        <div className="flex flex-col gap-3">
                            <a
                                href="mailto:suporte@oodelivery.com.br"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                            >
                                <div className="w-10 h-10 bg-[#ff3d03]/10 rounded-lg flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-[#ff3d03]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">E-mail</p>
                                    <p className="text-xs text-gray-500">suporte@oodelivery.com.br</p>
                                </div>
                            </a>

                            <a
                                href="https://wa.me/5511999999999?text=Olá! Preciso de ajuda com minha conta suspensa."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                            >
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                                    <p className="text-xs text-gray-500">(11) 99999-9999</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Logout */}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-sm text-gray-400 hover:text-gray-600"
                >
                    Sair da conta
                </Link>
            </div>
        </div>
    );
}
