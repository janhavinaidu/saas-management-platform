'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, User, Package, Calendar, MessageSquare } from 'lucide-react';
import { fetchWithAuth } from '@/services/apiClient';

type LicenseRequest = {
  id: number;
  request_type: string;
  status: string;
  user: {
    id: number;
    username: string;
    email: string;
    department: string | null;
  };
  software: {
    id: number;
    name: string;
    vendor: string;
    monthly_cost: number;
  };
  requested_by: {
    id: number;
    username: string;
    role: string | null;
  };
  original_requester: {
    id: number;
    username: string;
  } | null;
  reason: string;
  created_at: string;
};

type PendingRequestsResponse = {
  count: number;
  requests: LicenseRequest[];
};

type PendingRequestsPanelProps = {
  onRequestProcessed?: () => void;
};

export default function PendingRequestsPanel({ onRequestProcessed }: PendingRequestsPanelProps = {}) {
  const [requests, setRequests] = useState<LicenseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LicenseRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth('/api/pending-requests/');
      if (!response.ok) {
        throw new Error('Failed to fetch pending requests');
      }
      const data: PendingRequestsResponse = await response.json();
      setRequests(data.requests);
    } catch (err: any) {
      console.error('Failed to fetch pending requests:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReject = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(
        `/api/requests/${selectedRequest.id}/approve-reject/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            response: adminResponse,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${action} request`);
      }

      // Refresh the list
      await fetchPendingRequests();
      setShowModal(false);
      setSelectedRequest(null);
      setAdminResponse('');
      
      // Call the callback to refresh parent component
      if (onRequestProcessed) {
        onRequestProcessed();
      }
    } catch (err: any) {
      console.error(`Failed to ${action} request:`, err);
      alert(`Failed to ${action} request: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (request: LicenseRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
    setAdminResponse('');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pending License Requests</h3>
        </div>
        <div className="text-center py-8 text-gray-500">Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pending License Requests</h3>
        </div>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Pending License Requests</h3>
            {requests.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {requests.length}
              </span>
            )}
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        {request.user.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({request.user.department || 'No Department'})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{request.software.name}</span>
                      <span className="text-sm text-gray-500">
                        by {request.software.vendor}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        ${request.software.monthly_cost}/mo
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Requested by: <strong>{request.requested_by.username}</strong>
                        {request.requested_by.role && ` (${request.requested_by.role})`}
                      </span>
                    </div>

                    {request.original_requester && (
                      <div className="text-sm text-blue-600 mb-2">
                        Originally requested by: {request.original_requester.username}
                      </div>
                    )}

                    <div className="bg-gray-50 rounded p-3 mb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Justification:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{request.reason}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(request.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => openModal(request)}
                      className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                      className="flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-md hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval/Rejection Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Review License Request
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>User:</strong> {selectedRequest.user.username}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Software:</strong> {selectedRequest.software.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Requested by:</strong> {selectedRequest.requested_by.username}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response (optional):
              </label>
              <textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="Add a note about your decision..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setAdminResponse('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveReject('reject')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
              >
                {isSubmitting ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApproveReject('approve')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
              >
                {isSubmitting ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
