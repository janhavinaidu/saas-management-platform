'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { fetchWithAuth } from '@/services/apiClient';

const COLORS = ['#4f46e5', '#a855f7', '#06b6d4', '#64748b', '#a78bfa'];

type BackendUser = {
  id: number;
  username: string;
  email: string;
  department: string | null;
  role: string;
};

export default function AllocationChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsersFromBackend = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth('http://127.0.0.1:8000/api/users/');
        if (response.ok) {
          const users: BackendUser[] = await response.json();
          console.log('AllocationChart - Loaded users from backend:', users);

          // Aggregate user counts by department (not licenses, since we're counting users per department)
          const departmentMap: Record<string, number> = {};
          users.forEach(user => {
            if (!user.department || user.department === 'Not Assigned') {
              return;
            }
            departmentMap[user.department] = (departmentMap[user.department] || 0) + 1;
          });

          console.log('AllocationChart - Department map:', departmentMap);

          // Convert to chart data format
          const chartData = Object.entries(departmentMap).map(([name, value]) => ({ name, value }));
          console.log('AllocationChart - Chart data:', chartData);
          setData(chartData);
        } else {
          console.log('AllocationChart - Failed to fetch users');
          setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch users from backend:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsersFromBackend();

    // Refresh every 30 seconds
    const interval = setInterval(loadUsersFromBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="font-semibold text-lg text-gray-800">User Distribution by Department</h3>
      <p className="text-sm text-gray-700 mb-4">Number of users assigned to each department</p>
      <div style={{ width: '100%', height: 300 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">Loading...</div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No department data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name}: ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} users`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}