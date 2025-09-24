'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', spend: 68000 },
  { name: 'Feb', spend: 74000 },
  { name: 'Mar', spend: 71000 },
  { name: 'Apr', spend: 76000 },
  { name: 'May', spend: 81000 },
  { name: 'Jun', spend: 78000 },
];

export default function SpendChart() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg text-gray-800">Monthly Software Spend</h3>
            <p className="text-sm text-gray-500 mb-4">Total software expenses over the last 6 months</p>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                        <Bar dataKey="spend" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
