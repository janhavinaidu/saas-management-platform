'use client';

import { useState } from 'react';
import { fetchWithAuth } from '@/services/apiClient';
import { X, AlertCircle } from 'lucide-react';

type License = {
  id: number;
  name: string;
};

type ReportIssueModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userLicenses?: License[];
};

export default function ReportIssueModal({ isOpen, onClose, onSuccess, userLicenses = [] }: ReportIssueModalProps) {
  const [selectedLicense, setSelectedLicense] = useState('');
  const [issueType, setIssueType] = useState('ACCESS_ISSUE');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      software_name: selectedLicense,
      issue_type: issueType,
      description,
    };

    try {
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/report-issue/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      // Success - close modal and refresh
      setSelectedLicense('');
      setIssueType('ACCESS_ISSUE');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit issue report. Please try again.');
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedLicense('');
      setIssueType('ACCESS_ISSUE');
      setDescription('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-amber-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800">Report an Issue</h2>
          </div>
          <button 
            onClick={handleClose} 
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Report a problem with your software license. Your department head will be notified.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="software" className="block text-sm font-medium text-gray-700 mb-1">
                Software <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="software"
                value={selectedLicense}
                onChange={(e) => setSelectedLicense(e.target.value)}
                placeholder="e.g., Figma Professional, Slack Premium"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="issueType" className="block text-sm font-medium text-gray-700 mb-1">
                Issue Type <span className="text-red-500">*</span>
              </label>
              <select
                id="issueType"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                required
                disabled={isSubmitting}
              >
                <option value="ACCESS_ISSUE">Cannot Access / Login Problem</option>
                <option value="PERFORMANCE">Performance / Slow</option>
                <option value="BUG">Bug / Error</option>
                <option value="LICENSE_EXPIRED">License Expired</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Please describe the issue in detail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                required
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
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-wait"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
