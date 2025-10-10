'use client';

import { useState, useEffect } from 'react';
import { Bell, Send, User, Package, Calendar, MessageSquare } from 'lucide-react';
import { fetchWithAuth } from '@/services/apiClient';

type TeamRequest = {
  id: number;
  request_type: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  software: {
    id: number;
    name: string;
    monthly_cost: number;
  };
  reason: string;
  created_at: string;
};

type TeamRequestsResponse = {
  count: number;
  requests: TeamRequest[];
};

export default function DeptHeadRequestsPanel() {
  const [requests, setRequests] = useState<TeamRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<TeamRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeamRequests();
  }, []);

  const fetchTeamRequests = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/dept-head-requests/');
      if (!response.ok) {
        throw new Error('Failed to fetch team requests');
      }
      const data: TeamRequestsResponse = await response.json();
      setRequests(data.requests);
    } catch (err: any) {
      console.error('Failed to fetch team requests:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForwardToAdmin = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(
        `http://127.0.0.1:8000/api/requests/${selectedRequest.id}/forward/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comments,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to forward request');
      }

      // Refresh the list
      await fetchTeamRequests();
      setShowModal(false);
      setSelectedRequest(null);
      setComments('');
      alert('Request forwarded to admin successfully!');
    } catch (err: any) {
      console.error('Failed to forward request:', err);
      alert(`Failed to forward request: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (request: TeamRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
    setComments('');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Team License Requests</h3>
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
          <h3 className="text-lg font-semibold text-gray-900">Team License Requests</h3>
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
            <h3 className="text-lg font-semibold text-gray-900">Team License Requests</h3>
            {requests.length > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {requests.length}
              </span>
            )}
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>No pending requests from your team</p>
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
                        ({request.user.email})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{request.software.name}</span>
                      <span className="text-sm font-medium text-green-600">
                        ${request.software.monthly_cost}/mo
                      </span>
                    </div>

                    <div className="bg-gray-50 rounded p-3 mb-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">Justification:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{request.reason}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(request.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => openModal(request)}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Forward to Admin
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Forward Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Forward Request to Admin
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Team Member:</strong> {selectedRequest.user.username}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Software:</strong> {selectedRequest.software.name}
              </p>
              <div className="bg-gray-50 rounded p-3 mb-2">
                <p className="text-sm font-medium text-gray-700 mb-1">Original Request:</p>
                <p className="text-sm text-gray-600">{selectedRequest.reason}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Comments (optional):
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="Add your recommendation or comments for the admin..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setComments('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleForwardToAdmin}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? 'Forwarding...' : 'Forward to Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
