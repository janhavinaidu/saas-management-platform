'use client';

import { Search, Filter, Plus } from 'lucide-react';
import InventoryTable from '../../components/dashboard/InventoryTable';

// A simple component for the custom stat cards, kept local to this page.
const StatCard = ({ title, value, iconBgColor, iconDotColor }: { title: string, value: string, iconBgColor: string, iconDotColor: string }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex justify-between items-start">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${iconBgColor}`}>
            <div className={`h-2.5 w-2.5 rounded-full ${iconDotColor}`}></div>
        </div>
    </div>
);


export default function InventoryPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
          <p className="text-gray-500">Manage your software licenses and subscriptions</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search software..."
              className="pl-10 pr-4 py-2 w-40 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Software
          </button>
        </div>
      </div>

      {/* Stat Cards Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Software" value="24" iconBgColor="bg-blue-100" iconDotColor="bg-blue-500" />
        <StatCard title="Active Licenses" value="21" iconBgColor="bg-green-100" iconDotColor="bg-green-500" />
        <StatCard title="Expiring Soon" value="2" iconBgColor="bg-yellow-100" iconDotColor="bg-yellow-500" />
        <StatCard title="Expired" value="1" iconBgColor="bg-red-100" iconDotColor="bg-red-500" />
      </div>

      {/* Inventory Table Section */}
      <div>
        <InventoryTable />
      </div>
    </div>
  );
}

