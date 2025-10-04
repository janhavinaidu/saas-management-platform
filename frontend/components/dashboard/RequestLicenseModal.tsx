'use client';

import { useState, useEffect } from 'react';

// Define the shape of a single software license
type License = {
  id: number;
  name: string;
};

// Define the shape of the User object we expect to receive
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  licenses: License[];
};

// Define the shape of all props this component receives
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

  // This effect pre-fills the form when it opens in "revoke" mode.
  useEffect(() => {
    if (isOpen && softwareToRevoke) {
      setRequestType('REVOKE');
      setSoftwareName(softwareToRevoke.name);
    } else if (isOpen) {
      // Reset form for "grant" mode when opening
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

    // This is the payload that matches what the backend serializer expects.
    const payload = {
      user: user.id,
      request_type: requestType,
      software_name: softwareName,
      reason,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/license-requests/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let errorData: any = null;
        if (contentType.includes('application/json')) {
          errorData = await response.json().catch(() => null);
        }

        let message = `Request failed with status ${response.status}`;
        if (errorData) {
          if (typeof errorData.detail === 'string') {
            message = errorData.detail;
          } else if (Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
            message = errorData.non_field_errors[0];
          } else {
            const errorKeys = Object.keys(errorData);
            if (errorKeys.length > 0) {
              const key = errorKeys[0];
              const val = errorData[key];
              if (Array.isArray(val) && val.length > 0) {
                message = `${key}: ${val[0]}`;
              } else if (typeof val === 'string') {
                message = `${key}: ${val}`;
              }
            }
          }
        }
        throw new Error(message);
      }

      // If successful, call the callback to update the parent component's UI
      if (requestType === 'REVOKE') {
        onSubmitSuccess(user.id, softwareName);
      }
      
      onClose(); // Close the modal
      
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

