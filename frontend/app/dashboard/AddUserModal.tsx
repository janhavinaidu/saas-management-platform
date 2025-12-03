'use client';

import { useState } from 'react';
import { fetchWithAuth } from '../../services/apiClient';

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: () => void;
  autoDepartment?: string | null;  
};

export default function AddUserModal({
  isOpen,
  onClose,
  onAddUser,
  autoDepartment = null,
}: AddUserModalProps) {
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

    const username =
      fullName?.toLowerCase().replace(/\s+/g, '.') || email.split('@')[0];

    const role = formData.get('role') as string;
    const dept = autoDepartment || (formData.get('department') as string);

    const payload = {
      username,
      email,
      password: formData.get('password'),
      profile: {
        role: role,
        department: dept,
      },
    };

    try {
      const response = await fetchWithAuth(`/api/register/`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.detail ||
            Object.values(data).flat().join(' ') ||
            'Failed to add user'
        );
      }

      onAddUser();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-gray-900">

        <h2 className="text-xl font-semibold mb-4">Add New User</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input name="fullName" required className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input name="email" type="email" required className="input" />
          </div>

          {!autoDepartment && (
            <div>
              <label className="block text-sm font-medium">Department</label>
              <input name="department" required className="input" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Role</label>
            <select name="role" required className="input">
              <option value="USER">User</option>
              <option value="DEPT_HEAD">Department Head</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Temporary Password</label>
            <input name="password" type="password" required className="input" />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-gray">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-blue">
              {isSubmitting ? 'Adding…' : 'Add User'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
