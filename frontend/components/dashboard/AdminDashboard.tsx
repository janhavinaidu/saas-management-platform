'use client';

import { useState, useEffect } from 'react';
import { Users, CreditCard, TrendingUp } from 'lucide-react';
import { fetchWithAuth } from '@/services/apiClient';

// --- THIS IS THE CORRECTION ---
// Using standard alias paths for robust component resolution
import StatCard from '@/app/(dashboard)/StatCard';
import SpendChart from '@/app/(dashboard)/SpendChart';
import AllocationChart from '@/app/(dashboard)/AllocationChart';
import TopAppsTable from '@/app/(dashboard)/TopAppsTable';
import Navbar from '@/app/(dashboard)/Navbar';
import Sidebar from '@/app/(dashboard)/Sidebar';

// --- TYPE DEFINITIONS that EXACTLY match the backend responses ---
type DashboardStats = {
  total_licenses: number;
  active_users: number;
  cost_savings: number;
  total_monthly_cost: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const statsResponse = await fetchWithAuth('http://127.0.0.1:8000/api/dashboard-stats/');

        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard stats.');
        }

        const statsData: DashboardStats = await statsResponse.json();
        setStats(statsData);

      } catch (err: any) {
        console.error("Dashboard data fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6 animate-pulse">
        <h2 className="text-3xl font-bold tracking-tight h-10 bg-gray-200 rounded w-1/4"></h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4 h-80 bg-gray-200 rounded-lg"></div>
            <div className="col-span-3 h-80 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error loading dashboard: {error}</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Licenses"
          value={stats ? stats.total_licenses.toLocaleString() : '0'}
          change="Across all software"
          icon={<CreditCard className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Active Users"
          value={stats ? stats.active_users.toLocaleString() : '0'}
          change="In the last 30 days"
          icon={<Users className="h-5 w-5 text-purple-500" />}
        />
        <StatCard
          title="Cost Savings"
          value={stats ? `$${stats.cost_savings.toLocaleString()}` : '$0'}
          change={stats ? `Total Monthly Cost: $${stats.total_monthly_cost.toLocaleString()}` : '...'}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <SpendChart />
        </div>
        <div className="col-span-3">
          <AllocationChart />
        </div>
      </div>

      <div>
        <TopAppsTable />
      </div>
    </div>
  );
}

