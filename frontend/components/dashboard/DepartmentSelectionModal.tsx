'use client';

import { useState } from 'react';
import { fetchWithAuth } from '../../services/apiClient';

type DepartmentSelectionModalProps = {
  isOpen: boolean;
  onSuccess: () => void;
};

export default function DepartmentSelectionModal({ isOpen, onSuccess }: DepartmentSelectionModalProps) {
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!department.trim()) {
      setError('Please enter a department name');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetchWithAuth('/api/update-department/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department: department.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update department');
      }

      // Update the profile in localStorage
      const profileResponse = await fetchWithAuth('/api/profile/');
      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Select Your Department</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          As a Department Head, please specify which department you manage. This will be used to organize your team members.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department Name
            </label>
            <input
              type="text"
              name="department"
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              placeholder="e.g., Engineering, Marketing, Sales"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"
            />
          </div>
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
