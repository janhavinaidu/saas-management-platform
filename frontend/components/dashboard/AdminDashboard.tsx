'use client';

import React from 'react';
import { Users, CreditCard, TrendingUp } from 'lucide-react';

// Using standard alias paths for robust component resolution
import StatCard from '@/app/(dashboard)/StatCard';
import SpendChart from '@/app/(dashboard)/SpendChart';
import AllocationChart from '@/app/(dashboard)/AllocationChart';
import TopAppsTable from '@/app/(dashboard)/TopAppsTable';
/**
 * This is the main dashboard component for the Admin role.
 * It assembles various data visualization components into a comprehensive overview.
 */
export default function AdminDashboard() {
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-black">
            Overview of your SaaS license management
          </p>
        </div>
      </div>
      
      {/* Stat Cards Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Licenses"
          value="1,247"
          change="+12% from last month"
          icon={<CreditCard className="h-5 w-5 text-blue-500" />}
          changeType="increase"
        />
        <StatCard
          title="Active Users"
          value="4,892"
          change="+8% from last month"
          icon={<Users className="h-5 w-5 text-purple-500" />}
          changeType="increase"
        />
        <StatCard
          title="Cost Savings"
          value="$24,500"
          change="+18% from last quarter"
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          changeType="increase"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <SpendChart />
        </div>
        <div className="col-span-3">
          <AllocationChart />
        </div>
      </div>

      {/* Top Applications Table Section */}
      <div>
        <TopAppsTable />
      </div>
    </div>
  );
}

