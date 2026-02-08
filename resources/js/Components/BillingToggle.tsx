import { useState, useEffect } from 'react';
import clsx from 'clsx';

interface BillingToggleProps {
    onToggle: (isYearly: boolean) => void;
    discount?: number;
}

export default function BillingToggle({ onToggle, discount = 0 }: BillingToggleProps) {
    const [isYearly, setIsYearly] = useState(false);

    // Load preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('billingPreference');
        if (saved === 'yearly') {
            setIsYearly(true);
        }
    }, []);

    // Trigger callback and save preference
    const handleToggle = (yearly: boolean) => {
        setIsYearly(yearly);
        localStorage.setItem('billingPreference', yearly ? 'yearly' : 'monthly');
        onToggle(yearly);

        // Track event for analytics
        if (window.gtag) {
            window.gtag('event', 'billing_toggle', {
                billing_period: yearly ? 'yearly' : 'monthly',
            });
        }
    };

    return (
        <div className="flex justify-center items-center gap-4 mb-12">
            <span className={clsx(
                "text-lg font-semibold transition-colors",
                !isYearly ? "text-gray-900" : "text-gray-400"
            )}>
                Mensal
            </span>

            <button
                onClick={() => handleToggle(!isYearly)}
                role="switch"
                aria-checked={isYearly}
                aria-label="Toggle billing period"
                className={clsx(
                    "relative inline-flex h-10 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff3d03] focus:ring-offset-2",
                    isYearly ? "bg-[#ff3d03]" : "bg-gray-200"
                )}
            >
                <span
                    className={clsx(
                        "inline-block h-8 w-8 transform rounded-full bg-white shadow-lg transition-transform",
                        isYearly ? "translate-x-8" : "translate-x-1"
                    )}
                />
            </button>

            <div className="flex items-center gap-2">
                <span className={clsx(
                    "text-lg font-semibold transition-colors",
                    isYearly ? "text-gray-900" : "text-gray-400"
                )}>
                    Anual
                </span>

                {discount > 0 && isYearly && (
                    <span className="ml-2 inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                        Economize {discount}%
                    </span>
                )}
            </div>
        </div>
    );
}
