'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
// Corrected the import paths to be relative to fix the resolution error.
import AllUsersTable from '../../dashboard/AllUsersTable';
import AddUserModal from '../../dashboard/AddUserModal';

// A local component for the stat cards specific to this page's design.
const StatCard = ({ title, value, bgColor, textColor }: { title: string, value: string, bgColor: string, textColor: string }) => (
  <div className={`p-5 rounded-lg border border-gray-200 shadow-sm ${bgColor}`}>
    <p className="text-sm text-gray-600">{title}</p>
    <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
  </div>
);

export default function UsersPage() {
  // --- STATE FOR THE MODAL ---
  // This state variable will control whether the "Add User" modal is visible.
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-gray-500">Manage user accounts and license assignments</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-48 border border-gray-300 rounded-md text-sm"
              />
            </div>
            {/* This button's onClick handler now sets the state to true, opening the modal. */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Stat Cards Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value="1,247" bgColor="bg-white" textColor="text-gray-900" />
          <StatCard title="Active Users" value="1,180" bgColor="bg-white" textColor="text-green-600" />
          <StatCard title="Inactive Users" value="45" bgColor="bg-white" textColor="text-red-600" />
          <StatCard title="Pending Approval" value="22" bgColor="bg-white" textColor="text-yellow-600" />
        </div>

        {/* All Users Table Section */}
        <div>
          <AllUsersTable />
        </div>
      </div>

      {/* The Modal Component itself, controlled by our state. */}
      {/* It receives the state and the function to close itself. */}
      <AddUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

