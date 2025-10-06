'use client';
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#4f46e5', '#a855f7', '#06b6d4', '#64748b', '#a78bfa'];

type User = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  licenses: number;
  status: 'active' | 'inactive';
  lastActive: string;
};

export default function AllocationChart() {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsersFromLocalStorage = () => {
      setLoading(true);
      try {
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
          const users: User[] = JSON.parse(savedUsers);
          console.log('AllocationChart - Loaded users:', users);

          // Aggregate license counts by department
          const departmentMap: Record<string, number> = {};
          users.forEach(user => {
            if (!user.department) {
              console.log('User without department:', user);
              return;
            }
            departmentMap[user.department] = (departmentMap[user.department] || 0) + (user.licenses || 0);
          });

          console.log('AllocationChart - Department map:', departmentMap);

          // Convert to chart data format
          const chartData = Object.entries(departmentMap).map(([name, value]) => ({ name, value }));
          console.log('AllocationChart - Chart data:', chartData);
          setData(chartData);
        } else {
          console.log('AllocationChart - No users in localStorage');
          setData([]);
        }
      } catch (error) {
        console.error('Failed to parse users from localStorage:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsersFromLocalStorage();

    // Listen for storage changes to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'users') {
        loadUsersFromLocalStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="font-semibold text-lg text-gray-800">License Allocation by Department</h3>
      <p className="text-sm text-gray-700 mb-4">Distribution of software licenses across departments</p>
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
              <Tooltip formatter={(value: number) => `${value} licenses`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}