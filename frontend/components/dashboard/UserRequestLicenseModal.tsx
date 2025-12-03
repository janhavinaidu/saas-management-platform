'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/services/apiClient';
import { X } from 'lucide-react';

type UserRequestLicenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function UserRequestLicenseModal({ isOpen, onClose, onSuccess }: UserRequestLicenseModalProps) {
  const [softwareName, setSoftwareName] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      software_name: softwareName,
      reason,
    };

    try {
      const response = await fetchWithAuth('/api/user-license-request/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      // Success - close modal and refresh
      setSoftwareName('');
      setReason('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSoftwareName('');
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Request New License</h2>
          <button 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Submit a request for a new software license. Your department head will review and approve it.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="software" className="block text-sm font-medium text-gray-700 mb-1">
                Software Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="software"
                value={softwareName}
                onChange={(e) => setSoftwareName(e.target.value)}
                placeholder="e.g., Figma Professional, Adobe Creative Cloud"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason / Justification
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                placeholder="Explain why you need this software and how it will help your work..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait"
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
