'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'Engineering', value: 400 },
  { name: 'Marketing', value: 300 },
  { name: 'Sales', value: 200 },
  { name: 'HR', value: 150 },
  { name: 'Finance', value: 100 },
];

const COLORS = ['#4f46e5', '#a855f7', '#06b6d4', '#64748b', '#a78bfa'];

export default function AllocationChart() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg text-gray-800">License Allocation by Department</h3>
            <p className="text-sm text-gray-700 mb-4">Distribution of software licenses across departments</p>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
