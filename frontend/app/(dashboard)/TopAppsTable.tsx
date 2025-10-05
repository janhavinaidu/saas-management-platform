'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../services/apiClient';

// Type definition for a software item
type SoftwareItem = {
  id: number;
  name: string;
  total_licenses: number;
  monthly_cost: string;
  vendor?: string;
};

export default function TopAppsTable() {
  const [apps, setApps] = useState<SoftwareItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetchWithAuth('http://127.0.0.1:8000/api/saas-applications/');
        if (!response.ok) throw new Error('Failed to fetch software inventory.');
        const data: SoftwareItem[] = await response.json();
        // Sort descending by total_licenses and take top 7
        const sorted = [...data].sort((a, b) => b.total_licenses - a.total_licenses).slice(0, 7);
        setApps(sorted);
      } catch (err: any) {
        setError(err.message || 'Error loading top applications.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-lg text-gray-900">Top Software Applications</h3>
      <p className="text-sm text-gray-500 mb-4">Overview of your most used software licenses</p>
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <th className="p-3">Application Name</th>
                <th className="p-3 text-right">Total Licenses</th>
                <th className="p-3 text-right">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="p-3 whitespace-nowrap">
                    <div className="font-medium text-gray-800">{app.name}</div>
                    {app.vendor && <div className="text-xs text-gray-500">{app.vendor}</div>}
                  </td>
                  <td className="p-3 whitespace-nowrap text-right text-gray-600 font-medium">
                    {app.total_licenses.toLocaleString()}
                  </td>
                  <td className="p-3 whitespace-nowrap text-right text-gray-600 font-medium">
                    ${parseFloat(app.monthly_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}