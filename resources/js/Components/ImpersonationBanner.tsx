import { router } from '@inertiajs/react';
import { Shield, ArrowLeft, Eye } from 'lucide-react';

export default function ImpersonationBanner() {
    return (
        <div className="w-full bg-zinc-900 border-b border-white/5 px-4 py-2 relative z-[60]">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-zinc-800 rounded-lg">
                        <Eye className="w-4 h-4 text-[#ff3d03]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white text-xs font-black uppercase tracking-widest leading-none">
                            Modo de Visualização (Suporte)
                        </span>
                        <span className="text-zinc-500 text-[10px] font-bold">
                            Você está acessando como o administrador da loja.
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => router.post(route('admin.impersonate.leave'))}
                    className="flex items-center gap-2 px-4 py-1.5 bg-[#ff3d03]/10 hover:bg-[#ff3d03] text-[#ff3d03] hover:text-white rounded-lg text-xs font-black transition-all group"
                >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    Voltar ao Super Admin
                </button>
            </div>
        </div>
    );
}
