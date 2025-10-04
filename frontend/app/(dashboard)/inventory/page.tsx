'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
// Corrected the import paths to be relative to fix resolution errors
import InventoryTable from '../../../components/dashboard/InventoryTable';
import AddSoftwareModal from '../../dashboard/AddSoftwareModal';
import { fetchWithAuth } from '../../../services/apiClient';

// A local component for the custom stat cards, kept within this page file for simplicity.
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

// This defines the shape of the statistics object we expect from the backend API.
type InventoryStats = {
    total_software: number;
    active_licenses: number;
    expiring_soon: number;
    expired: number;
};


export default function InventoryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // State to hold the dynamic data for the stat cards
  const [stats, setStats] = useState<InventoryStats | null>(null);
  // We use a 'key' to force child components to re-render and re-fetch their data.
  const [refreshKey, setRefreshKey] = useState(0);

  // This `useEffect` hook fetches the summary statistics when the page loads
  // or whenever the `refreshKey` changes.
  useEffect(() => {
    const fetchStats = async () => {
        try {
            const response = await fetchWithAuth('http://127.0.0.1:8000/api/inventory-stats/');
            if (!response.ok) throw new Error('Could not fetch inventory statistics.');
            const data: InventoryStats = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch inventory stats:", error);
        }
    };
    fetchStats();
  }, [refreshKey]); // The dependency array ensures this runs on mount and on refresh

  // This function is called by child components (modals, table) on a successful data change.
  const handleDataChange = () => {
    // By changing the key, we trigger a re-fetch of stats and tell the table to refresh.
    setRefreshKey(prevKey => prevKey + 1); 
  };

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
            <StatCard title="Total Software" value={stats ? stats.total_software.toString() : '...'} iconBgColor="bg-blue-100" iconDotColor="bg-blue-500" />
            <StatCard title="Active Licenses" value={stats ? stats.active_licenses.toString() : '...'} iconBgColor="bg-green-100" iconDotColor="bg-green-500" />
            <StatCard title="Expiring Soon" value={stats ? stats.expiring_soon.toString() : '...'} iconBgColor="bg-yellow-100" iconDotColor="bg-yellow-500" />
            <StatCard title="Expired" value={stats ? stats.expired.toString() : '...'} iconBgColor="bg-red-100" iconDotColor="bg-red-500" />
        </div>

        {/* Inventory Table Section */}
        <div>
          {/* We pass the key and the data change handler to the table component */}
          <InventoryTable />
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

