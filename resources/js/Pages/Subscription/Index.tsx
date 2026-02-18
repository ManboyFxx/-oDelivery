import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { CreditCard, Check, ShieldCheck, Zap, Package, Users, Bike, Ticket, BarChart3, Calendar, ArrowUpRight } from 'lucide-react';

interface Props {
    auth: any;
    tenant: any;
    currentPlan: string;
    subscriptionStatus: string;
    plan: any;
    usage: any;
}

export default function SubscriptionIndex({ auth, tenant, plan, usage }: Props) {
    const isActive = tenant.subscription_status === 'active';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-black text-2xl text-gray-900 tracking-tight">Gerenciar Assinatura</h2>}
        >
            <Head title="Minha Assinatura" />

            <div className="py-12 bg-[#fafafa] min-h-[calc(100-80px)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Premium Status Header */}
                    <div className="relative overflow-hidden bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff3d03]/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        
                        <div className="relative z-10 flex items-center gap-6">
                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600 animate-pulse'}`}>
                                {isActive ? <ShieldCheck className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-2xl font-black text-gray-900">{plan?.name || 'Plano Único'}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {isActive ? 'Ativo' : 'Inativo / Pendente'}
                                    </span>
                                </div>
                                <p className="text-gray-500 font-medium">
                                    {isActive 
                                        ? 'Sua conta possui acesso ilimitado a todos os recursos.' 
                                        : 'Aguardando confirmação de pagamento para liberar o acesso.'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center">
                             {!isActive && (
                                <Link 
                                    href={route('subscription.checkout', 'unified')}
                                    className="px-8 py-4 rounded-2xl bg-[#ff3d03] text-white font-black text-sm hover:bg-[#e63703] transition-all shadow-xl shadow-[#ff3d03]/20 flex items-center gap-2"
                                >
                                    Fazer Pagamento
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                             )}
                             {isActive && (
                                <div className="text-right">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ciclo de Cobrança</span>
                                    <div className="flex items-center gap-2 font-bold text-gray-900">
                                        <Calendar className="w-4 h-4 text-[#ff3d03]" />
                                        {tenant.billing_cycle === 'yearly' ? 'Anual' : 'Mensal'}
                                    </div>
                                </div>
                             )}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Plan Details & Limits */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-[#ff3d03]" />
                                        Detalhes Financeiros
                                    </h3>
                                </div>
                                
                                <div className="p-8">
                                    <div className="grid md:grid-cols-2 gap-12 mb-10">
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 font-bold text-sm uppercase tracking-tighter">Valor</span>
                                                <span className="font-black text-2xl text-gray-900">R$ {plan?.price ? plan.price.toFixed(2).replace('.', ',') : '129,90'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-400 font-bold text-sm uppercase tracking-tighter">Expira em</span>
                                                <span className={`font-black text-sm ${isActive ? 'text-gray-900' : 'text-red-500'}`}>
                                                    {tenant.subscription_ends_at 
                                                        ? new Date(tenant.subscription_ends_at).toLocaleDateString() 
                                                        : 'Não definido'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-[#fafafa] rounded-2xl p-6 border border-gray-100">
                                            <p className="text-xs font-bold text-gray-500 leading-relaxed italic">
                                                "O Plano Único garante que você nunca será cobrado a mais por vender muito. Sem limite de pedidos, sem fricção."
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-gray-50">
                                        <IncludedBenefit text="Pedidos Ilimitados" />
                                        <IncludedBenefit text="Produtos Ilimitados" />
                                        <IncludedBenefit text="Usuários App/PDV" />
                                        <IncludedBenefit text="Impressão Automática" />
                                        <IncludedBenefit text="WhatsApp ÓoBot" />
                                        <IncludedBenefit text="Suporte Prioritário" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment History Placeholder */}
                            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Histórico Recente</h3>
                                <div className="text-center py-12">
                                    <div className="bg-gray-50 inline-flex items-center justify-center p-4 rounded-full mb-4">
                                        <BarChart3 className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-sm text-gray-400 font-bold tracking-tight">Em breve você poderá visualizar suas faturas detalhadas aqui.</p>
                                </div>
                            </div>
                        </div>

                        {/* Usage Dashboard Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-[#ff3d03]" />
                                    Métricas de Uso
                                </h3>
                                
                                <div className="space-y-10">
                                    <UsageStatItem icon={<Package className="w-4 h-4"/>} label="Pedidos" count={usage.orders} units="/mês" />
                                    <UsageStatItem icon={<Package className="w-4 h-4"/>} label="Produtos" count={usage.products} units="total" />
                                    <UsageStatItem icon={<Users className="w-4 h-4"/>} label="Equipe" count={usage.users} units="membros" />
                                    <UsageStatItem icon={<Bike className="w-4 h-4"/>} label="Motoboys" count={usage.motoboys} units="membros" />
                                    <UsageStatItem icon={<Ticket className="w-4 h-4"/>} label="Cupons" count={usage.coupons} units="ativos" />
                                </div>

                                <div className="mt-12 p-6 rounded-[24px] bg-gradient-to-br from-[#ff3d03] to-[#e63700] text-white">
                                    <Trophy className="w-8 h-8 mb-4 opacity-50" />
                                    <h4 className="font-black text-lg mb-2 leading-tight">Poder Ilimitado</h4>
                                    <p className="text-[10px] font-bold opacity-80 leading-relaxed uppercase tracking-widest">
                                        Você está no plano máximo. Não há barreiras para o seu crescimento hoje.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function IncludedBenefit({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-green-50 flex items-center justify-center">
                <Check className="w-3 h-3 text-green-500" />
            </div>
            <span className="text-xs font-bold text-gray-600">{text}</span>
        </div>
    );
}

function UsageStatItem({ icon, label, count, units }: { icon: any, label: string, count: number, units: string }) {
    return (
        <div className="group">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-[#ff3d03]/5 transition-colors">
                        {icon}
                    </div>
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-tighter">{label}</span>
                </div>
                <div className="text-right">
                    <span className="text-lg font-black text-gray-900">{count}</span>
                    <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">{units}</span>
                </div>
            </div>
            <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden border border-gray-100">
                <div 
                    className="bg-[#ff3d03] h-full rounded-full opacity-60 transition-all duration-1000 shadow-[0_0_10px_rgba(255,61,3,0.3)]" 
                    style={{ width: `${Math.min((count / 50) * 100, 100)}%` }} // Visual feedback, 50 as a soft target
                ></div>
            </div>
        </div>
    );
}

function Trophy(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    );
}
