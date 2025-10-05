'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import InventoryTable from '../../../components/dashboard/InventoryTable';
import AddSoftwareModal from '../../dashboard/AddSoftwareModal';
import { fetchWithAuth } from '../../../services/apiClient';

const StatCard = ({
  title,
  value,
  iconBgColor,
  iconDotColor,
}: {
  title: string;
  value: string;
  iconBgColor: string;
  iconDotColor: string;
}) => (
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

type InventoryStats = {
  total_software: number;
  active_licenses: number;
  expiring_soon: number;
  expired: number;
};

export default function InventoryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchWithAuth('http://127.0.0.1:8000/api/inventory-stats/');
        if (!response.ok) throw new Error('Could not fetch inventory statistics.');
        const data: InventoryStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch inventory stats:", error);
        setStats(null);
      }
    };
    fetchStats();
  }, [refreshKey]);

  const handleDataChange = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Helper to safely get stat values
  const getStatValue = (value: unknown) =>
    typeof value === 'number' && !isNaN(value) ? value.toString() : '...';

  return (
    <>
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
              <input type="text" placeholder="Search software..." className="pl-10 pr-4 py-2 w-40 border border-gray-300 rounded-md text-sm" />
            </div>
            <button className="flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Software
            </button>
          </div>
        </div>

        {/* Stat Cards Section - Now powered by dynamic data from our state */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Software"
            value={getStatValue(stats?.total_software)}
            iconBgColor="bg-blue-100"
            iconDotColor="bg-blue-500"
          />
          <StatCard
            title="Active Licenses"
            value={getStatValue(stats?.active_licenses)}
            iconBgColor="bg-green-100"
            iconDotColor="bg-green-500"
          />
          <StatCard
            title="Expiring Soon"
            value={getStatValue(stats?.expiring_soon)}
            iconBgColor="bg-yellow-100"
            iconDotColor="bg-yellow-500"
          />
          <StatCard
            title="Expired"
            value={getStatValue(stats?.expired)}
            iconBgColor="bg-red-100"
            iconDotColor="bg-red-500"
          />
        </div>

        {/* Inventory Table Section */}
        <div>
          <InventoryTable key={refreshKey} />
        </div>
      </div>

      {/* The "Add Software" modal, which is a separate instance from the "Edit" modal */}
      <AddSoftwareModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleDataChange}
      />
    </>
  );
}