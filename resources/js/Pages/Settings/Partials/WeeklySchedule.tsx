import React from 'react';

interface BusinessHours {
    [key: string]: {
        is_open: boolean;
        open_time: string;
        close_time: string;
    };
}

const dayNames: { [key: string]: string } = {
    monday: 'Seg',
    tuesday: 'Ter',
    wednesday: 'Qua',
    thursday: 'Qui',
    friday: 'Sex',
    saturday: 'Sáb',
    sunday: 'Dom',
};

// Order of days for display
const daysvars = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function WeeklySchedule({ hours }: { hours: BusinessHours }) {
    return (
        <div className="bg-gray-50 dark:bg-premium-dark rounded-xl p-4 mb-6 overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Visão Geral da Semana</h4>
            <div className="flex justify-between gap-2 min-w-[300px]">
                {daysvars.map((day) => {
                    const info = hours[day];
                    const isOpen = info?.is_open;

                    return (
                        <div key={day} className="flex flex-col items-center flex-1">
                            <span className="text-xs text-gray-500 font-medium mb-1">{dayNames[day]}</span>
                            <div className={`
                                w-full rounded-lg py-2 px-1 text-center border
                                ${isOpen
                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                    : 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 opacity-60'
                                }
                            `}>
                                <div className={`text-xs font-bold ${isOpen ? 'text-green-700 dark:text-green-400' : 'text-gray-400'}`}>
                                    {isOpen ?
                                        <>
                                            <div>{info.open_time.slice(0, 5)}</div>
                                            <div className="text-[10px] opacity-75">até</div>
                                            <div>{info.close_time.slice(0, 5)}</div>
                                        </>
                                        : 'Fechado'
                                    }
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
