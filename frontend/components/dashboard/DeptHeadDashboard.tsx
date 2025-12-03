'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, Package } from 'lucide-react';
import StatCard from '@/app/(dashboard)/StatCard';
import DepartmentUserTable from '@/components/dashboard/DepartmentUserTable';
import DepartmentSelectionModal from '@/components/dashboard/DepartmentSelectionModal';
import DeptHeadRequestsPanel from '@/components/dashboard/DeptHeadRequestsPanel';
import TeamIssuesPanel from '@/components/dashboard/TeamIssuesPanel';
import { fetchWithAuth } from '@/services/apiClient';

type DepartmentStats = {
  team_members: number;
  department_spend: number;
  total_licenses: number;
  department_name: string;
};

/**
 * The main dashboard component for a Department Head.
 * It provides an overview of their specific department's SaaS usage and costs.
 */
export default function DeptHeadDashboard() {
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentName, setDepartmentName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkDepartment();
  }, []);

  const checkDepartment = async () => {
    try {
      const response = await fetchWithAuth('/api/profile/');
      if (response.ok) {
        const profile = await response.json();
        if (!profile.department) {
          setShowDepartmentModal(true);
        } else {
          setDepartmentName(profile.department);
          // Fetch department stats after confirming department exists
          await fetchDepartmentStats();
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartmentStats = async () => {
    try {
      const response = await fetchWithAuth('/api/department-stats/');
      if (response.ok) {
        const data: DepartmentStats = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Failed to fetch department stats:', response.status, errorData);
        setError(`Failed to load department stats: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching department stats:', error);
      setError('Error loading department statistics');
    }
  };

  const handleDepartmentSet = () => {
    setShowDepartmentModal(false);
    checkDepartment(); // Refresh to get the updated department
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 text-gray-900 bg-white rounded-lg p-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {departmentName ? `${departmentName} Department` : 'Department Dashboard'}
          </h2>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Stat cards with department-specific data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Team Members"
            value={stats ? stats.team_members.toString() : '0'}
            change="In your department"
            icon={<Users className="h-4 w-4 text-black" />}
          />
          <StatCard
            title="Department Spend"
            value={stats ? `$${stats.department_spend.toLocaleString()}` : '$0'}
            change="Monthly software costs"
            icon={<DollarSign className="h-4 w-4 text-black" />}
          />
          <StatCard
            title="Total Licenses"
            value={stats ? stats.total_licenses.toString() : '0'}
            change="Assigned to team"
            icon={<Package className="h-4 w-4 text-black" />}
          />
        </div>

        {/* Team requests and issues panels */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <DeptHeadRequestsPanel />
          </div>
          <div>
            <TeamIssuesPanel />
          </div>
        </div>

        {/* The main content area with the user table */}
        <div>
          <DepartmentUserTable />
        </div>
      </div>

      <DepartmentSelectionModal
        isOpen={showDepartmentModal}
        onSuccess={handleDepartmentSet}
      />
    </>
  );
}

