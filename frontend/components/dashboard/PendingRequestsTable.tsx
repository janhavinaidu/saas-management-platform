'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/services/apiClient';
import { Check, X } from 'lucide-react';

// --- TYPE DEFINITIONS for the data from the backend ---
type User = { username: string };
type Software = { name: string };
type LicenseRequest = {
  id: number;
  request_type: 'GRANT' | 'REVOKE';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: User;
  software: Software;
  requested_by: User;
  created_at: string;
};

/**
 * A component for Admins to view and manage pending license requests.
 */
export default function PendingRequestsTable() {
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch the list of pending requests from the backend
  const fetchRequests = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth('/api/pending-requests/');
      if (!response.ok) throw new Error('Failed to fetch pending requests.');
      const data = await response.json();
      setRequests(data.requests || data);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run the fetch function once when the component first loads
  useEffect(() => {
    fetchRequests();
  }, []);

  // Function to handle approving or rejecting a request
  const handleUpdateRequest = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetchWithAuth(`/api/requests/${requestId}/approve-reject/`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Failed to update request.');
      
      // On success, refresh the list to remove the processed item
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert('Error updating request.');
    }
  };

  if (isLoading) return <div className="p-4 text-center text-gray-500">Loading pending requests...</div>;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-bold text-xl text-gray-800 mb-4">Pending License Requests</h3>
      {requests.length === 0 ? (
        <p className="text-gray-500">No pending requests at this time.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="p-3">Request</th>
                <th className="p-3">For User</th>
                <th className="p-3">Requested By</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="p-3">
                    <span className={`font-semibold ${req.request_type === 'GRANT' ? 'text-green-600' : 'text-red-600'}`}>
                      {req.request_type}
                    </span>
                    <span className="ml-2 text-gray-800 font-medium">{req.software.name}</span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{req.user.username}</td>
                  <td className="p-3 text-sm text-gray-600">{req.requested_by.username}</td>
                  <td className="p-3 text-sm text-gray-600">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right space-x-2">
                    <button 
                      onClick={() => handleUpdateRequest(req.id, 'approve')} 
                      className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                      title="Approve Request"
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      onClick={() => handleUpdateRequest(req.id, 'reject')} 
                      className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                      title="Reject Request"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
