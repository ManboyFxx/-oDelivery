import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
    data: { method: string; total: number; count: number }[];
}

export default function PaymentMethodsChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400">Sem dados para exibir</div>;
    }

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="total"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Total']}
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#111827',
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-[43%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">
                    {formatCurrency(data.reduce((acc, curr) => acc + curr.total, 0))}
                </p>
            </div>
        </div>
    );
}
