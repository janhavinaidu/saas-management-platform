'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/services/apiClient'; // <-- THE MOST IMPORTANT CHANGE IS USING THIS

// --- TYPE DEFINITIONS ---
type License = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string; // The modal uses 'name' internally
  email: string;
  role: string;
  licenses: License[];
};

type RequestLicenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: (userId: number, licenseName: string) => void;
  user: User | null;
  softwareToRevoke: License | null;
};

export default function RequestLicenseModal({ isOpen, onClose, onSubmitSuccess, user, softwareToRevoke }: RequestLicenseModalProps) {
  const [requestType, setRequestType] = useState('GRANT');
  const [softwareName, setSoftwareName] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && softwareToRevoke) {
      setRequestType('REVOKE');
      setSoftwareName(softwareToRevoke.name);
    } else if (isOpen) {
      setRequestType('GRANT');
      setSoftwareName('');
      setReason('');
      setError('');
    }
  }, [isOpen, softwareToRevoke]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      user: user.id,
      request_type: requestType,
      software_name: softwareName,
      reason,
    };

    try {
      // --- THIS IS THE FIX ---
      // We now use our smart fetchWithAuth function, which automatically
      // adds the authentication token to the request.
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/license-requests/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      if (requestType === 'REVOKE') {
        onSubmitSuccess(user.id, softwareName);
      }
      
      onClose();
      
    } catch (err: any) {
      setError(err.message);
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">New License Request</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Submitting a request for <span className="font-semibold">{user.name}</span>.
        </p>

        <form onSubmit={handleSubmit}>
          {/* ... (the rest of the form JSX remains the same) ... */}
           <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                disabled={!!softwareToRevoke}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="GRANT">Grant New License</option>
                <option value="REVOKE">Revoke Existing License</option>
              </select>
            </div>
            <div>
              <label htmlFor="software" className="block text-sm font-medium text-gray-700 mb-1">Software Name</label>
              <input
                type="text"
                id="software"
                value={softwareName}
                onChange={(e) => setSoftwareName(e.target.value)}
                placeholder="e.g., Figma Professional"
                disabled={!!softwareToRevoke}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
              />
            </div>
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason / Justification</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g., Required for new marketing project"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mt-4 text-center">{error}</p>}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

