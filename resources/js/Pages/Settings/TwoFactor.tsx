import { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Shield, AlertCircle, Copy, Check, X, Eye, EyeOff } from 'lucide-react';

interface TwoFactorPageProps {
    isEnabled: boolean;
    remainingCodes: number;
}

interface SetupState {
    secret: string | null;
    qrCodeUrl: string | null;
    step: 'idle' | 'generating' | 'verifying' | 'confirming';
    error: string | null;
}

export default function TwoFactor({ isEnabled, remainingCodes }: TwoFactorPageProps) {
    const [setup, setSetup] = useState<SetupState>({
        secret: null,
        qrCodeUrl: null,
        step: 'idle',
        error: null,
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [password, setPassword] = useState('');
    const [showDisablePassword, setShowDisablePassword] = useState(false);
    const [disabling, setDisabling] = useState(false);

    const startSetup = async () => {
        setSetup(prev => ({ ...prev, step: 'generating', error: null }));

        try {
            const response = await fetch(route('two-factor.enable'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setSetup(prev => ({
                    ...prev,
                    secret: data.secret,
                    qrCodeUrl: data.qrCodeUrl,
                    step: 'idle',
                }));
                setShowModal(true);
            } else {
                setSetup(prev => ({
                    ...prev,
                    step: 'idle',
                    error: data.error || 'Erro ao gerar QR code',
                }));
            }
        } catch (err) {
            setSetup(prev => ({
                ...prev,
                step: 'idle',
                error: 'Erro ao conectar ao servidor',
            }));
        }
    };

    const verifyAndConfirm = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setSetup(prev => ({
                ...prev,
                error: 'Digite um código de 6 dígitos',
            }));
            return;
        }

        setSetup(prev => ({ ...prev, step: 'verifying', error: null }));

        try {
            const response = await fetch(route('two-factor.confirm'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    secret: setup.secret,
                    code: verificationCode,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setRecoveryCodes(data.recovery_codes || []);
                setSetup(prev => ({
                    ...prev,
                    step: 'confirming',
                }));
                setVerificationCode('');
            } else {
                setSetup(prev => ({
                    ...prev,
                    step: 'idle',
                    error: data.error || 'Código inválido',
                }));
            }
        } catch (err) {
            setSetup(prev => ({
                ...prev,
                step: 'idle',
                error: 'Erro ao verificar código',
            }));
        }
    };

    const finalize = () => {
        setShowModal(false);
        setSetup({ secret: null, qrCodeUrl: null, step: 'idle', error: null });
        setVerificationCode('');
        setRecoveryCodes([]);
        // Reload page to update UI
        window.location.reload();
    };

    const disableTwoFactor = async () => {
        if (!password) {
            setSetup(prev => ({
                ...prev,
                error: 'Digite sua senha para desativar 2FA',
            }));
            return;
        }

        setDisabling(true);

        try {
            const response = await fetch(route('two-factor.disable'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setPassword('');
                setSetup({ secret: null, qrCodeUrl: null, step: 'idle', error: null });
                window.location.reload();
            } else {
                setSetup(prev => ({
                    ...prev,
                    error: data.error || 'Erro ao desativar 2FA',
                }));
            }
        } catch (err) {
            setSetup(prev => ({
                ...prev,
                error: 'Erro ao conectar ao servidor',
            }));
        } finally {
            setDisabling(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Autenticação de Dois Fatores
                        </h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Adicione uma camada extra de segurança à sua conta usando 2FA
                    </p>
                </div>

                {/* Error Message */}
                {setup.error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-lg flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p>{setup.error}</p>
                    </div>
                )}

                {isEnabled ? (
                    <>
                        {/* Status Card - 2FA Enabled */}
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-200 dark:bg-green-900/40">
                                        <Check className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                                        2FA Ativado
                                    </h3>
                                    <p className="text-green-700 dark:text-green-200 mb-4">
                                        Sua conta está protegida com autenticação de dois fatores.
                                    </p>
                                    <p className="text-sm text-green-600 dark:text-green-300">
                                        Recovery codes restantes: <span className="font-bold">{remainingCodes}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Recovery Codes Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Recovery Codes
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                Se perder acesso ao seu autenticador, use esses códigos para acessar sua conta. Cada código pode ser usado uma única vez.
                            </p>

                            <button
                                onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
                            >
                                {showRecoveryCodes ? (
                                    <>
                                        <EyeOff className="h-4 w-4" />
                                        Ocultar Códigos
                                    </>
                                ) : (
                                    <>
                                        <Eye className="h-4 w-4" />
                                        Mostrar Códigos
                                    </>
                                )}
                            </button>

                            {showRecoveryCodes && (
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4 font-mono text-sm space-y-2">
                                    {remainingCodes === 0 ? (
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Todos os recovery codes foram utilizados. Gere novos códigos abaixo.
                                        </p>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                                            Você tem {remainingCodes} código(s) restante(s).
                                        </p>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    // TODO: Implement regenerate recovery codes
                                    alert('Função em desenvolvimento');
                                }}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Gerar Novos Recovery Codes
                            </button>
                        </div>

                        {/* Disable 2FA Section */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-red-900 dark:text-red-100 mb-4">
                                Desativar 2FA
                            </h2>
                            <p className="text-red-700 dark:text-red-200 mb-4 text-sm">
                                Desativar 2FA reduzirá a segurança de sua conta. Digite sua senha para confirmar.
                            </p>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha"
                                className="w-full px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg dark:bg-red-900/20 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />

                            <button
                                onClick={disableTwoFactor}
                                disabled={disabling || !password}
                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {disabling ? 'Desativando...' : 'Desativar 2FA'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Status Card - 2FA Disabled */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-yellow-200 dark:bg-yellow-900/40">
                                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                                        2FA Não Ativado
                                    </h3>
                                    <p className="text-yellow-700 dark:text-yellow-200">
                                        Proteja sua conta ativando autenticação de dois fatores.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Setup Button */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                Ativar 2FA
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Você precisará de um aplicativo autenticador como Google Authenticator, Microsoft Authenticator ou Authy.
                            </p>

                            <button
                                onClick={startSetup}
                                disabled={setup.step !== 'idle'}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                            >
                                {setup.step === 'generating' ? 'Gerando QR Code...' : 'Ativar 2FA'}
                            </button>
                        </div>
                    </>
                )}

                {/* Setup Modal */}
                {showModal && setup.secret && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
                            {setup.step === 'confirming' ? (
                                <>
                                    {/* Recovery Codes Display */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            Recovery Codes
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Salve esses códigos em local seguro. Você precisará deles se perder acesso ao seu autenticador.
                                        </p>

                                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6 font-mono text-sm space-y-2 max-h-48 overflow-y-auto">
                                            {recoveryCodes.map((code, idx) => (
                                                <div key={idx} className="text-gray-800 dark:text-gray-200">
                                                    {code}
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(recoveryCodes.join('\n'));
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-3 transition-colors"
                                        >
                                            <Copy className="h-4 w-4" />
                                            Copiar Códigos
                                        </button>

                                        <button
                                            onClick={finalize}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Entendo, Continuar
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* QR Code */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            Escanear QR Code
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Abra seu aplicativo autenticador e escaneie este código.
                                        </p>

                                        {setup.qrCodeUrl && (
                                            <div className="bg-white p-4 rounded-lg mb-6 flex justify-center">
                                                <img
                                                    src={setup.qrCodeUrl}
                                                    alt="QR Code"
                                                    className="w-64 h-64"
                                                />
                                            </div>
                                        )}

                                        {/* Manual Entry */}
                                        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                Ou insira manualmente:
                                            </p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                                                {setup.secret}
                                            </p>
                                        </div>

                                        {/* Verification Code Input */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Código de Verificação (6 dígitos)
                                            </label>
                                            <input
                                                type="text"
                                                value={verificationCode}
                                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="000000"
                                                maxLength={6}
                                                className="w-full px-4 py-2 text-center text-2xl tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowModal(false);
                                                    setSetup({ secret: null, qrCodeUrl: null, step: 'idle', error: null });
                                                    setVerificationCode('');
                                                }}
                                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={verifyAndConfirm}
                                                disabled={setup.step === 'verifying' || verificationCode.length !== 6}
                                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                {setup.step === 'verifying' ? 'Verificando...' : 'Verificar'}
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
