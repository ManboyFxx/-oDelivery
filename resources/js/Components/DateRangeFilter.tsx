import { useState, useEffect } from 'react';
import { format, subDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { usePage, router } from '@inertiajs/react';
import { DayPicker, DateRange } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { Popover, Transition } from '@headlessui/react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { Fragment } from 'react';
import 'react-day-picker/dist/style.css';
import { clsx } from 'clsx';

export default function DateRangeFilter() {
    const { url } = usePage();
    const queryParams = new URLSearchParams(window.location.search);

    // Parse initial state from URL or defaults
    const initialStart = queryParams.get('start_date') ? new Date(queryParams.get('start_date')!) : startOfMonth(new Date());
    const initialEnd = queryParams.get('end_date') ? new Date(queryParams.get('end_date')!) : endOfMonth(new Date());

    const [range, setRange] = useState<DateRange | undefined>({
        from: initialStart,
        to: initialEnd,
    });

    // Preset ranges configuration
    const presets = [
        { label: 'Hoje', getValue: () => ({ from: new Date(), to: new Date() }) },
        { label: 'Últimos 7 dias', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
        { label: 'Últimos 30 dias', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
        { label: 'Este Mês', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    ];

    const handleApply = (selectedRange: DateRange | undefined) => {
        if (!selectedRange?.from) return;

        const start = format(selectedRange.from, 'yyyy-MM-dd');
        const end = selectedRange.to ? format(selectedRange.to, 'yyyy-MM-dd') : start;

        router.get(
            window.location.pathname,
            { ...Object.fromEntries(queryParams), start_date: start, end_date: end },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePresetClick = (getPresetValue: () => DateRange) => {
        const newRange = getPresetValue();
        setRange(newRange);
        handleApply(newRange);
    };

    // Label logic
    const getLabel = () => {
        if (!range?.from) return 'Selecionar Data';

        // Check for presets match
        const matchingPreset = presets.find(p => {
            const pRange = p.getValue();
            return isSameDay(pRange.from!, range.from!) && isSameDay(pRange.to!, range.to!);
        });

        if (matchingPreset) return matchingPreset.label;

        if (range.to && !isSameDay(range.from, range.to)) {
            return `${format(range.from, 'dd/MM')} - ${format(range.to, 'dd/MM')}`;
        }

        return format(range.from, 'dd MMM');
    };

    return (
        <Popover className="relative">
            {({ open, close }) => (
                <>
                    <Popover.Button
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1b1e] rounded-xl font-bold text-sm shadow-sm transition-all border",
                            open ? "ring-2 ring-[#ff3d03] border-transparent" : "border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5",
                            "text-gray-700 dark:text-gray-300"
                        )}
                    >
                        <Calendar className="h-4 w-4 text-[#ff3d03]" />
                        <span>{getLabel()}</span>
                        <ChevronDown className={clsx("h-3 w-3 transition-transform", open && "rotate-180")} />
                    </Popover.Button>

                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute z-50 mt-2 w-[340px] md:w-[600px] bg-white dark:bg-[#1a1b1e] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden right-0" style={{ maxWidth: 'calc(100vw - 32px)' }}>
                            <div className="flex flex-col md:flex-row">
                                {/* Presets Sidebar */}
                                <div className="p-2 md:w-40 border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                                    {presets.map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => { handlePresetClick(preset.getValue); close(); }}
                                            className="px-3 py-2 text-sm font-medium rounded-lg hover:bg-white dark:hover:bg-white/5 hover:shadow-sm text-left truncate transition-all text-gray-600 dark:text-gray-400 whitespace-nowrap"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Calendar */}
                                <div className="p-4 flex-1">
                                    <DayPicker
                                        mode="range"
                                        defaultMonth={range?.from}
                                        selected={range}
                                        onSelect={setRange}
                                        locale={ptBR}
                                        numberOfMonths={1}
                                        modifiersClassNames={{
                                            selected: 'bg-[#ff3d03] text-white',
                                            today: 'font-bold text-[#ff3d03]',
                                        }}
                                        styles={{
                                            head_cell: { width: '40px', color: '#6b7280' },
                                            cell: { width: '40px' },
                                            day: { margin: 'auto', borderRadius: '8px' },
                                            nav_button: { color: '#ff3d03' }
                                        }}
                                    />

                                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                        <button
                                            onClick={() => close()}
                                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={() => { handleApply(range); close(); }}
                                            className="px-4 py-2 bg-[#ff3d03] hover:bg-[#e63700] text-white text-sm font-bold rounded-lg shadow-lg shadow-[#ff3d03]/20"
                                        >
                                            Aplicar Filtro
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}
