// app/(dashboard)/page.tsx
import React from "react";
import StatCard from "./StatCard";
import SpendChart from "./SpendChart";
import AllocationChart from "./AllocationChart";
import TopAppsTable from "./TopAppsTable";

import { Users, CreditCard, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-6 pt-4">

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Licenses"
          value="1,247"
          change="+12% from last month"
          icon={<CreditCard className="h-6 w-6 text-gray-700" />}
          changeType="increase"
        />
        <StatCard
          title="Active Users"
          value="4,892"
          change="+8% from last month"
          icon={<Users className="h-6 w-6 text-gray-700" />}
          changeType="increase"
        />
        <StatCard
          title="Cost Savings"
          value="$24,500"
          change="+18% from last quarter"
          icon={<TrendingUp className="h-6 w-6 text-gray-700" />}
          changeType="increase"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <SpendChart />
        </div>
        <div className="col-span-3">
          <AllocationChart />
        </div>
      </div>

      {/* Top Apps Table */}
      <div>
        <TopAppsTable />
      </div>
    </div>
  );
}
