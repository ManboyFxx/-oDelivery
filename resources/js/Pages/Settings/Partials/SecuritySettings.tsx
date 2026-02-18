import React from 'react';
import { Shield, Smartphone, Key, Lock, AlertTriangle } from 'lucide-react';
import { Switch } from '@headlessui/react';

interface SecuritySettingsProps {
    data: any;
    setData: (field: string, value: any) => void;
}

export default function SecuritySettings({ data, setData }: SecuritySettingsProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#ff3d03]" />
                    Segurança e Autenticação
                </h3>

                <div className="space-y-6">
                    {/* Login com Senha */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-premium-dark rounded-2xl">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-blue-500">
                                <Key className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Login com Senha</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Permite que clientes criem uma senha fixa para login. Ideal para reduzir custos com SMS/WhatsApp.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={data.enable_password_login}
                            onChange={(checked: boolean) => setData('enable_password_login', checked)}
                            className={`${
                                data.enable_password_login ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-700'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                            <span
                                className={`${
                                    data.enable_password_login ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>
                    </div>

                    {/* Verificação OTP */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-premium-dark rounded-2xl">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-green-500">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Autenticação OTP (WhatsApp)</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Exige um código enviado via WhatsApp no login. <br/>
                                    <span className="text-xs text-orange-500 font-bold">Custo adicional por envio.</span>
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={data.enable_otp_verification}
                            onChange={(checked: boolean) => setData('enable_otp_verification', checked)}
                            className={`${
                                data.enable_otp_verification ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-700'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                            <span
                                className={`${
                                    data.enable_otp_verification ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-[#ff3d03]" />
                    Proteção de Checkout e Fraude
                </h3>

                <div className="space-y-6">
                     {/* Checkout Security */}
                     <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-2xl">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-orange-500">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Verificação de Identidade no Checkout</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Se o login OTP estiver desativado, exige confirmação dos <strong>4 últimos dígitos do telefone</strong> para novos dispositivos antes de finalizar o pedido.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={data.enable_checkout_security}
                            onChange={(checked: boolean) => setData('enable_checkout_security', checked)}
                            className={`${
                                data.enable_checkout_security ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-700'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                            <span
                                className={`${
                                    data.enable_checkout_security ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>
                    </div>

                    {/* Quick Login (Trusted Devices) */}
                     <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-premium-dark rounded-2xl">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white dark:bg-white/5 rounded-lg text-purple-500">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Login Rápido em Dispositivos Confiáveis</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Memoriza navegadores seguros por 90 dias, permitindo login apenas confirmando a identidade, sem senha/OTP a todo momento.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={data.enable_quick_login}
                            onChange={(checked: boolean) => setData('enable_quick_login', checked)}
                            className={`${
                                data.enable_quick_login ? 'bg-[#ff3d03]' : 'bg-gray-200 dark:bg-gray-700'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                            <span
                                className={`${
                                    data.enable_quick_login ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    );
}
