'use client';

import { useState } from 'react';
import { fetchWithAuth } from '../../services/apiClient';

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: () => void;
};

export default function AddUserModal({ isOpen, onClose, onAddUser }: AddUserModalProps) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    const fullName = (formData.get('fullName') as string)?.trim();
    const email = formData.get('email') as string;
    const department = formData.get('department') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;

    // Auto-username generation
    const username =
      fullName?.toLowerCase().replace(/\s+/g, '.') ||
      email.split('@')[0];

    const payload = {
      username,
      email,
      password,
      department,
      role,
    };

    try {
      const response = await fetchWithAuth(`/api/register/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {}

        throw new Error(
          errorData.detail ||
            Object.values(errorData).flat().join(' ') ||
            'Failed to add user'
        );
      }

      onAddUser(); // Refresh table
      onClose();   // Close modal
    } catch (err: any) {
      setError(err.message || 'Failed to add user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-gray-900">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Enter details for the new user account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Department</label>
            <input
              type="text"
              name="department"
              required
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              name="role"
              required
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm"
            >
              <option value="USER">User</option>
              <option value="DEPT_HEAD">Department Head</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Temporary Password</label>
            <input
              type="password"
              name="password"
              required
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Adding…' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
