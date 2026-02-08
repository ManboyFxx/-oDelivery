import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
    data: { name: string; quantity: number; total: number }[];
}

export default function TopProductsChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400">Sem dados para exibir</div>;
    }

    const COLORS = ['#ff3d03', '#ff6b3d', '#ff8e6b', '#ffb098', '#ffd3c5'];

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value} vendas`, 'Qtd']}
                    />
                    <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
