import React from 'react';
import { Palette, Printer } from 'lucide-react';

interface SystemSettingsProps {
    data: any;
    setData: (field: string, value: any) => void;
}

export default function SystemSettings({ data, setData }: SystemSettingsProps) {
    return (
        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#ff3d03]" />
                Personalização do Menu Público
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cor do Tema
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="color"
                            value={data.theme_color}
                            onChange={(e) => setData('theme_color', e.target.value)}
                            className="h-12 w-24 rounded-xl border border-gray-300 dark:border-white/10 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={data.theme_color}
                            onChange={(e) => setData('theme_color', e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                            placeholder="#ff3d03"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Esta cor será aplicada aos botões, destaques e elementos principais do menu público.
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-premium-dark p-6 rounded-2xl">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Pré-visualização</h4>
                    <div className="space-y-3">
                        <button
                            type="button"
                            style={{ backgroundColor: data.theme_color }}
                            className="w-full py-3 rounded-xl text-white font-bold"
                        >
                            Botão Principal
                        </button>
                        <div className="flex gap-3">
                            <div
                                style={{ backgroundColor: data.theme_color, opacity: 0.1 }}
                                className="flex-1 h-20 rounded-xl"
                            ></div>
                            <div
                                style={{ backgroundColor: data.theme_color, opacity: 0.2 }}
                                className="flex-1 h-20 rounded-xl"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
