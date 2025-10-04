'use client';

import { Users, DollarSign, Package } from 'lucide-react';
import StatCard from '@/app/(dashboard)/StatCard';
import DepartmentUserTable from '@/components/dashboard/DepartmentUserTable';

/**
 * The main dashboard component for a Department Head.
 * It provides an overview of their specific department's SaaS usage and costs.
 */
export default function DeptHeadDashboard() {
  return (
    <div className="space-y-4 text-gray-900 bg-white rounded-lg p-6">
      <div className="flex items-center justify-between space-y-2">
        {/* We can make this dynamic later, e.g., "Marketing Department" */}
        <h2 className="text-3xl font-bold tracking-tight">Department Dashboard</h2>
      </div>

      {/* Stat cards with department-specific data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Team Members"
          value="14"
          change="+2 new this month"
          icon={<Users className="h-4 w-4 text-black" />}
          changeType="increase"
        />
        <StatCard
          title="Department Spend"
          value="$4,850"
          change="-5% from last month"
          icon={<DollarSign className="h-4 w-4 text-black" />}
          changeType="decrease"
        />
        <StatCard
          title="Total Licenses"
          value="48"
          change="+8 assigned this month"
          icon={<Package className="h-4 w-4 text-black" />}
          changeType="increase"
        />
      </div>

      {/* The main content area with the user table */}
      <div>
        <DepartmentUserTable />
      </div>
    </div>
  );
}

