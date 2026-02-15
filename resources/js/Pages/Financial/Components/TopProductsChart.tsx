import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
    data: { name: string; quantity: number; total: number }[];
    light?: boolean;
}

export default function TopProductsChart({ data, light = false }: Props) {
    if (!data || data.length === 0) {
        return <div className={`h-64 flex items-center justify-center ${light ? 'text-white/60' : 'text-gray-400'}`}>Sem dados para exibir</div>;
    }

    const COLORS = light
        ? ['#ffffff', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)']
        : ['#ff3d03', '#ff6b3d', '#ff8e6b', '#ffb098', '#ffd3c5'];

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold', fill: light ? '#ffffff' : '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: '#111827',
                            color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [`${value} vendas`, 'Qtd']}
                    />
                    <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
