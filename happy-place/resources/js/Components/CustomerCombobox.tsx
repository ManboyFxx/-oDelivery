import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, User, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface Customer {
    id: string;
    name: string;
    phone: string;
    loyalty_points?: number;
}

interface Props {
    customers: Customer[];
    value: Customer | null;
    onChange: (customer: Customer | null) => void;
}

export default function CustomerCombobox({ customers, value, onChange }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCustomers = query === ''
        ? customers
        : customers.filter((customer) =>
            customer.name.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone.includes(query)
        );

    return (
        <div className="relative" ref={containerRef}>
            <div
                className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-3 text-sm focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500 cursor-pointer dark:bg-[#2c2d30] dark:border-gray-700 dark:text-white"
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className={clsx("truncate", !value && "text-gray-400")}>
                        {value ? value.name : "Selecionar cliente..."}
                    </span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </div>

            {open && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm dark:bg-[#2c2d30] dark:ring-gray-700">
                    <div className="sticky top-0 bg-white p-2 border-b dark:bg-[#2c2d30] dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                className="w-full rounded-md border border-gray-200 bg-gray-50 py-1 pl-7 pr-2 text-xs focus:border-yellow-500 focus:ring-yellow-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                placeholder="Buscar nome ou telefone..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {filteredCustomers.length === 0 && (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-400">
                            Nenhum cliente encontrado.
                        </div>
                    )}

                    {filteredCustomers.map((customer) => (
                        <div
                            key={customer.id}
                            className={clsx(
                                "relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-yellow-50 dark:hover:bg-yellow-900/10",
                                value?.id === customer.id ? "text-yellow-600 bg-yellow-50 dark:text-yellow-500 dark:bg-yellow-900/10" : "text-gray-900 dark:text-gray-200"
                            )}
                            onClick={() => {
                                onChange(customer);
                                setOpen(false);
                                setQuery('');
                            }}
                        >
                            <div className="flex flex-col">
                                <span className="block truncate font-medium">{customer.name}</span>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{customer.phone}</span>
                                    {customer.loyalty_points !== undefined && (
                                        <span className="flex items-center gap-0.5 text-yellow-600 dark:text-yellow-500 font-bold bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">
                                            {customer.loyalty_points} pts
                                        </span>
                                    )}
                                </div>
                            </div>

                            {value?.id === customer.id && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-yellow-600">
                                    <Check className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Option to clear selection */}
                    {value && (
                        <div
                            className="border-t border-gray-100 dark:border-gray-700 py-2 px-3 text-center text-xs text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 cursor-pointer"
                            onClick={() => {
                                onChange(null);
                                setOpen(false);
                            }}
                        >
                            Remover seleção
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
