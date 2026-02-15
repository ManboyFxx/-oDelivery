import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Switch } from '@headlessui/react';
import WeeklySchedule from './WeeklySchedule';
import SecondaryButton from '@/Components/SecondaryButton';

interface BusinessHours {
    [key: string]: {
        is_open: boolean;
        open_time: string;
        close_time: string;
    };
}

interface BusinessHoursSettingsProps {
    businessHours: BusinessHours;
    setBusinessHours: (hours: BusinessHours) => void;
    setData: (field: string, value: any) => void;
}

const dayNames: { [key: string]: string } = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo',
};

export default function BusinessHoursSettings({
    businessHours,
    setBusinessHours,
    setData
}: BusinessHoursSettingsProps) {

    const updateBusinessHours = (day: string, field: string, value: any) => {
        const updated = {
            ...businessHours,
            [day]: {
                ...businessHours[day],
                [field]: value,
            },
        };
        setBusinessHours(updated);
        setData('business_hours', JSON.stringify(updated));
    };

    const replicateHours = (sourceDay: string, targetDays: string[]) => {
        if (!confirm('Isso irá copiar o horário de ' + dayNames[sourceDay] + ' para os outros dias selecionados. Continuar?')) return;

        const source = businessHours[sourceDay];
        const updated = { ...businessHours };

        targetDays.forEach(day => {
            updated[day] = { ...source };
        });

        setBusinessHours(updated);
        setData('business_hours', JSON.stringify(updated));
    };

    return (
        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold">
                <Clock className="h-5 w-5 text-[#ff3d03]" />
                Horários de Funcionamento
            </h3>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Integração com Menu Público</p>
                    <p className="mt-1">Os horários configurados aqui serão exibidos no menu público. Quando fora do horário, será mostrado um banner "Fechado".</p>
                </div>
            </div>

            <WeeklySchedule hours={businessHours} />

            <div className="flex flex-wrap gap-2 mb-4">
                <SecondaryButton
                    type="button"
                    onClick={() => replicateHours('monday', ['tuesday', 'wednesday', 'thursday', 'friday'])}
                    className="text-xs"
                >
                    Copiar Seg ➔ Sex
                </SecondaryButton>
                <SecondaryButton
                    type="button"
                    onClick={() => replicateHours('monday', ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])}
                    className="text-xs"
                >
                    Copiar Seg ➔ Sáb
                </SecondaryButton>
                <SecondaryButton
                    type="button"
                    onClick={() => replicateHours('monday', ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])}
                    className="text-xs"
                >
                    Copiar Seg ➔ Todos
                </SecondaryButton>
            </div>

            <div className="space-y-4">
                {Object.keys(businessHours).map((day) => (
                    <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-premium-dark rounded-2xl">
                        <div className="w-32">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{dayNames[day]}</span>
                        </div>

                        <Switch
                            checked={businessHours[day].is_open}
                            onChange={(checked) => updateBusinessHours(day, 'is_open', checked)}
                            className={`${businessHours[day].is_open ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer`}
                        >
                            <span
                                className={`${businessHours[day].is_open ? 'translate-x-6' : 'translate-x-1'
                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </Switch>

                        {businessHours[day].is_open ? (
                            <div className="flex items-center gap-3">
                                <input
                                    type="time"
                                    value={businessHours[day].open_time}
                                    onChange={(e) => updateBusinessHours(day, 'open_time', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                />
                                <span className="text-gray-500 font-medium">até</span>
                                <input
                                    type="time"
                                    value={businessHours[day].close_time}
                                    onChange={(e) => updateBusinessHours(day, 'close_time', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-[#ff3d03] focus:border-transparent bg-white dark:bg-premium-dark text-gray-900 dark:text-white"
                                />
                            </div>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">Fechado</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
