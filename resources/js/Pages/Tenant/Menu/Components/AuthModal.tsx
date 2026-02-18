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
    const [authStep, setAuthStep] = useState<'phone' | 'name' | 'password' | 'setup_otp' | 'setup_password' | 'login_otp'>('phone');
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [setupMessage, setSetupMessage] = useState('');

    // Initialize Device Fingerprint
    useEffect(() => {
        if (!localStorage.getItem('device_fingerprint')) {
            const fingerprint = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : 'device-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
            localStorage.setItem('device_fingerprint', fingerprint);
        }
    }, []);

    const resetState = () => {
        setPhone('');
        setName('');
        setPassword('');
        setOtpCode('');
        setAuthStep('phone');
        setSetupMessage('');
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

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
                if (response.data.trusted_device) {
                    onLogin(response.data.customer);
                    handleClose();
                    toast.success(`Bem-vindo de volta, ${response.data.customer.name}!`);
                } else if (response.data.requires_password) {
                    setAuthStep('password');
                    toast.info(response.data.message || 'Digite sua senha.');
                } else if (response.data.requires_setup) {
                    setAuthStep('setup_otp');
                    setSetupMessage(response.data.message || 'Vamos criar uma senha para você.');
                    // Trigger OTP send automatically? Or user button?
                    // Let's trigger automatically since user intends to login
                    await requestSetupOtp();
                } else if (response.data.requires_otp) {
                    setAuthStep('login_otp');
                    toast.info('Código enviado para seu WhatsApp.');
                }
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

    const requestSetupOtp = async () => {
        try {
            await axios.post('/customer/send-setup-otp', {
                phone,
                tenant_slug: slug
            });
            toast.success('Código de verificação enviado!');
        } catch (error) {
            console.error('Error sending setup OTP:', error);
            toast.error('Erro ao enviar código.');
        }
    };

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/customer/login-password', {
                phone,
                password,
                tenant_slug: slug,
                device_fingerprint: localStorage.getItem('device_fingerprint') || 'unknown-device'
            });

            if (response.data.success) {
                onLogin(response.data.customer);
                handleClose();
                toast.success('Login realizado com sucesso!');
            }
        } catch (error: any) {
             console.error('Error logging in with password:', error);
             toast.error(error.response?.data?.message || 'Senha incorreta.');
        } finally {
            setLoading(false);
        }
    };

    const handleSetupOtpVerify = async (e: React.FormEvent) => {
        e.preventDefault();
         // Just move to password creation, verification happens on final submit?
         // OR verify first? Backend setupPassword verifies OTP.
         // Let's move to password input step carrying the code.
         setAuthStep('setup_password');
    }

    const handleSetupPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
             const response = await axios.post('/customer/setup-password', {
                phone,
                code: otpCode,
                password,
                tenant_slug: slug,
                device_fingerprint: localStorage.getItem('device_fingerprint') || 'unknown-device'
            });

            if (response.data.success) {
                onLogin(response.data.customer);
                handleClose();
                toast.success('Senha definida e Login realizado!');
            }
        } catch (error: any) {
            console.error('Error setting password:', error);
            toast.error(error.response?.data?.message || 'Erro ao definir senha.');
            if (error.response?.status === 422) {
                 // OTP invalid, go back?
                 setAuthStep('setup_otp');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLoginOtpVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/customer/verify-otp', {
                phone,
                code: otpCode,
                tenant_slug: slug,
                device_fingerprint: localStorage.getItem('device_fingerprint') || 'unknown-device'
            });

            if (response.data.valid) {
                onLogin(response.data.customer);
                handleClose();
                toast.success('Verificação concluída!');
            }
        } catch (error: any) {
             console.error('Error verifying OTP:', error);
             toast.error(error.response?.data?.message || 'Código inválido.');
        } finally {
            setLoading(false);
        }
    }


    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/customer/complete-registration', {
                phone,
                name,
                tenant_slug: slug
            });
            
            if (response.data.requires_setup) {
                 setAuthStep('setup_otp');
                 setSetupMessage('Cadastro inicial feito! Agora vamos criar sua senha.');
                 await requestSetupOtp();
            } else {
                 // Fallback (should not happen with new backend logic aimed for security)
                onLogin(response.data.customer);
                handleClose();
                toast.success(`Cadastro realizado com sucesso!`);
            }

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
                onClick={handleClose}
            />

            <div className="bg-white dark:bg-premium-dark rounded-2xl p-6 max-w-md w-full relative z-10 shadow-xl animate-in fade-in zoom-in duration-300 transition-colors duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                        {authStep === 'phone' ? 'Entrar ou Cadastrar' :
                         authStep === 'name' ? 'Seus Dados' :
                         authStep === 'password' ? 'Digite sua Senha' :
                         authStep === 'setup_otp' || authStep === 'login_otp' ? 'Verificação de Segurança' :
                         'Criar Senha'
                        }
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {authStep === 'phone' && (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                Número de Telefone
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="(00) 00000-0000"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent transition-all outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white dark:placeholder-gray-500"
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
                )}

                {authStep === 'password' && (
                     <form onSubmit={handlePasswordLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="******"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent transition-all outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white dark:placeholder-gray-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Entrar...' : 'Entrar'}
                        </button>
                         <button
                            type="button"
                            onClick={() => {
                                setAuthStep('setup_otp');
                                requestSetupOtp();
                            }}
                            className="w-full text-sm text-gray-500 hover:text-[#ff3d03] transition-colors"
                        >
                            Esqueci minha senha (Criar nova)
                        </button>
                    </form>
                )}

                {(authStep === 'setup_otp' || authStep === 'login_otp') && (
                     <form onSubmit={authStep === 'setup_otp' ? handleSetupOtpVerify : handleLoginOtpVerify} className="space-y-4">
                         {setupMessage && (
                              <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg mb-4">
                                  {setupMessage}
                              </div>
                         )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Código enviado via WhatsApp do CartZapp
                            </label>
                            <input
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent transition-all outline-none text-center tracking-widest text-lg bg-white dark:bg-white/5 text-gray-900 dark:text-white dark:placeholder-gray-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Verificando...' : (authStep === 'setup_otp' ? 'Validar e Criar Senha' : 'Entrar')}
                        </button>
                    </form>
                )}

                {authStep === 'setup_password' && (
                     <form onSubmit={handleSetupPasswordSubmit} className="space-y-4">
                        <div>
                             <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg mb-4">
                                  Número verificado! Crie sua senha de acesso.
                              </div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                Nova Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                minLength={6}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent transition-all outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white dark:placeholder-gray-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Definir Senha e Entrar'}
                        </button>
                    </form>
                )}

                {authStep === 'name' && (
                    <form onSubmit={handleNameSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                                Seu Nome
                            </label>
                            <input
                                placeholder="Digite seu nome"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent transition-all outline-none bg-white dark:bg-white/5 text-gray-900 dark:text-white dark:placeholder-gray-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Cadastrando...' : 'Continuar'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
