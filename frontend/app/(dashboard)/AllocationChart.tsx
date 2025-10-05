'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { fetchWithAuth } from '../../services/apiClient';

const COLORS = ['#4f46e5', '#a855f7', '#06b6d4', '#64748b', '#a78bfa'];

type User = {
  id: number;
  department: string;
  licenses: number;
};

export default function AllocationChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth('http://127.0.0.1:8000/api/users/');
        if (!response.ok) throw new Error('Failed to fetch users');
        const users: User[] = await response.json();

        // Aggregate license counts by department
        const departmentMap: Record<string, number> = {};
        users.forEach(user => {
          if (!user.department) return;
          departmentMap[user.department] = (departmentMap[user.department] || 0) + (user.licenses || 0);
        });

        // Convert to chart data format
        const chartData = Object.entries(departmentMap).map(([name, value]) => ({ name, value }));
        setData(chartData);
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="font-semibold text-lg text-gray-800">License Allocation by Department</h3>
      <p className="text-sm text-gray-700 mb-4">Distribution of software licenses across departments</p>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          {loading ? (
            <div className="flex items-center justify-center h-full">Loading...</div>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name }) => name}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}