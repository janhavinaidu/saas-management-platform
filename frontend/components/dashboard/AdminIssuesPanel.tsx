'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, User, Calendar, CheckCircle, Clock, XCircle, Building2 } from 'lucide-react';
import { fetchWithAuth } from '@/services/apiClient';

type AdminIssue = {
  id: number;
  software_name: string;
  issue_type: string;
  status: string;
  description: string;
  reported_by: {
    id: number;
    username: string;
    email: string;
    department: string | null;
  };
  created_at: string;
  updated_at: string;
};

type AdminIssuesResponse = {
  count: number;
  issues: AdminIssue[];
};

const getIssueTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    ACCESS_ISSUE: 'Access Issue',
    PERFORMANCE: 'Performance',
    BUG: 'Bug/Error',
    LICENSE_EXPIRED: 'License Expired',
    FEATURE_REQUEST: 'Feature Request',
    OTHER: 'Other'
  };
  return labels[type] || type;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'OPEN':
      return <AlertCircle className="h-4 w-4" />;
    case 'IN_PROGRESS':
      return <Clock className="h-4 w-4" />;
    case 'RESOLVED':
      return <CheckCircle className="h-4 w-4" />;
    case 'CLOSED':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

export default function AdminIssuesPanel() {
  const [issues, setIssues] = useState<AdminIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<AdminIssue | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchAllIssues();
  }, []);

  const fetchAllIssues = async () => {
    setIsLoading(true);
    setError('');
    try {
      // ✅ FIXED: removed localhost
      const response = await fetchWithAuth('/api/admin-issues/');
      if (!response.ok) throw new Error('Failed to fetch issues');

      const data: AdminIssuesResponse = await response.json();
      setIssues(data.issues);
    } catch (err: any) {
      console.error('Failed to fetch issues:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedIssue || !newStatus) return;

    setIsSubmitting(true);
    try {
      // ✅ FIXED: removed localhost
      const response = await fetchWithAuth(
        `/api/issues/${selectedIssue.id}/status/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error('Failed to update issue status');

      await fetchAllIssues();
      setShowModal(false);
      setSelectedIssue(null);
      setNewStatus('');
    } catch (err: any) {
      console.error('Failed:', err);
      alert(`Failed to update issue status: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (issue: AdminIssue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">All Issues</h3>
        </div>
        <div className="text-center py-8 text-gray-500">Loading issues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">All Issues</h3>
        </div>
        <div className="text-center py-8 text-red-600">{error}</div>
      </div>
    );
  }

  const filteredIssues =
    filterStatus === 'ALL'
      ? issues
      : issues.filter(i => i.status === filterStatus);

  const openIssues = issues.filter(i => i.status === 'OPEN');
  const inProgressIssues = issues.filter(i => i.status === 'IN_PROGRESS');

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Active Issues</h3>
            {issues.length > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {issues.length} Total
              </span>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700"
          >
            <option value="ALL">All Active</option>
            <option value="OPEN">Open Only</option>
            <option value="IN_PROGRESS">In Progress Only</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">{openIssues.length}</div>
            <div className="text-sm text-red-700">Open</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">{inProgressIssues.length}</div>
            <div className="text-sm text-yellow-700">In Progress</div>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>No issues found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">{issue.software_name}</span>

                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          issue.status
                        )}`}
                      >
                        {getStatusIcon(issue.status)}
                        <span>{issue.status.replace('_', ' ')}</span>
                      </span>

                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {getIssueTypeLabel(issue.issue_type)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 mb-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>
                          <strong>{issue.reported_by.username}</strong>
                        </span>
                      </div>

                      {issue.reported_by.department && (
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4" />
                          <span>{issue.reported_by.department}</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded p-3 mb-2">
                      <p className="text-sm text-gray-700">{issue.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(issue.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => openModal(issue)}
                    className="ml-4 px-3 py-1.5 bg-orange-600 text-white text-sm font-semibold rounded-md hover:bg-orange-700"
                  >
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Issue Status</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Software:</strong> {selectedIssue.software_name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Reported by:</strong> {selectedIssue.reported_by.username}
                {selectedIssue.reported_by.department && ` (${selectedIssue.reported_by.department})`}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Issue Type:</strong> {getIssueTypeLabel(selectedIssue.issue_type)}
              </p>
              <div className="bg-gray-50 rounded p-3 mb-2">
                <p className="text-sm text-gray-700">{selectedIssue.description}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status:</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedIssue(null);
                  setNewStatus('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateStatus}
                disabled={isSubmitting}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-orange-400"
              >
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
