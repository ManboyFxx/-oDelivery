import { Check, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface ComparisonFeature {
    name: string;
    free?: string | boolean;
    pro?: string | boolean;
    custom?: string | boolean;
    description?: string;
}

interface Plan {
    id: string;
    name: string;
    price: number;
    interval: string;
}

interface PricingComparisonProps {
    plans: Plan[];
    comparisonData: ComparisonFeature[];
}

export default function PricingComparison({ plans, comparisonData }: PricingComparisonProps) {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const activeFeatures = comparisonData.filter(feature => feature.name && feature.name.trim() !== '');

    const getPlanValue = (feature: ComparisonFeature, planId: string): string | boolean | undefined => {
        return feature[planId as keyof ComparisonFeature];
    };

    const renderFeatureValue = (value: string | boolean | undefined) => {
        if (value === true) {
            return <Check className="h-5 w-5 text-green-600 mx-auto" />;
        }
        if (value === false) {
            return <X className="h-5 w-5 text-gray-300 mx-auto" />;
        }
        if (typeof value === 'string') {
            return <span className="text-sm font-medium text-gray-900">{value}</span>;
        }
        return null;
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-8 text-center">
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                    Comparação Detalhada
                </h2>
                <p className="text-gray-500 text-lg">
                    Veja exatamente o que está incluído em cada plano
                </p>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                <table className="w-full">
                    {/* Table Header */}
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left py-4 px-6 font-bold text-gray-900 w-1/3">
                                Recurso
                            </th>
                            {plans.map(plan => (
                                <th
                                    key={plan.id}
                                    className={clsx(
                                        "text-center py-4 px-6 font-bold",
                                        plan.id === 'pro'
                                            ? "bg-[#ff3d03]/5 text-[#ff3d03]"
                                            : "text-gray-900"
                                    )}
                                >
                                    {plan.name}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                        {activeFeatures.map((feature, idx) => (
                            <tr
                                key={feature.name || idx}
                                className={clsx(
                                    "border-b border-gray-100 transition-colors",
                                    idx % 2 === 0 ? "bg-white" : "bg-gray-50",
                                    expandedRow === feature.name && "bg-blue-50"
                                )}
                            >
                                {/* Feature Name */}
                                <td className="py-4 px-6">
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1">
                                            <button
                                                className="text-left font-semibold text-gray-900 hover:text-[#ff3d03] transition-colors text-sm md:text-base"
                                                onClick={() => setExpandedRow(
                                                    expandedRow === feature.name ? null : feature.name
                                                )}
                                            >
                                                {feature.name}
                                            </button>

                                            {/* Expandable Description */}
                                            {feature.description && (
                                                <>
                                                    {expandedRow === feature.name && (
                                                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                                                            {feature.description}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Feature Values */}
                                {plans.map(plan => (
                                    <td
                                        key={plan.id}
                                        className={clsx(
                                            "py-4 px-6 text-center",
                                            plan.id === 'pro' && "bg-[#ff3d03]/2"
                                        )}
                                    >
                                        {renderFeatureValue(getPlanValue(feature, plan.id))}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>Incluído</span>
                </div>
                <div className="flex items-center gap-2">
                    <X className="h-5 w-5 text-gray-300" />
                    <span>Não incluído</span>
                </div>
                <div className="text-[#ff3d03] font-bold">
                    Plano Recomendado: Pro
                </div>
            </div>
        </div>
    );
}
