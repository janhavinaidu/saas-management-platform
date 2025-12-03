'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '@/services/apiClient';

// Define the User type
type User = {
  id: number;
  username: string;
  email: string;
  department: string;
  role: string;
  licenses: number;
  status: 'active' | 'inactive';
  lastActive: string;
};

// Define the props for the modal
type EditUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEditUser: (user: User) => void;
  user: User | null;
};

export default function EditUserModal({ isOpen, onClose, onEditUser, user }: EditUserModalProps) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    department: '',
    role: '',
    status: 'active' as 'active' | 'inactive',
    licenses: 0
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        department: user.department,
        role: user.role,
        status: user.status,
        licenses: user.licenses
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // ❗ FIXED — RELATIVE URL (automatically uses API_BASE_URL inside fetchWithAuth)
      const response = await fetchWithAuth(`/api/users/${user.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          department: formData.department,
          role: formData.role,
          is_active: formData.status === 'active',
        }),
      });

      const responseData = await response.json();

      const updatedUser: User = {
        ...user,
        username: formData.username,
        email: responseData.user.email,
        department: responseData.user.department || 'Not Assigned',
        role: responseData.user.role,
        status: formData.status,
        licenses: formData.licenses
      };

      onEditUser(updatedUser);
      onClose();

    } catch (err: any) {
      console.error('Failed to update user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-gray-900">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              disabled
              className="mt-1 w-full px-3 py-2 border bg-gray-100 rounded-md text-gray-900"
            />
          </div>

          {/* email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* department */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              name="department"
              type="text"
              value={formData.department}
              onChange={handleInputChange}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* role */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md"
            >
              <option value="USER">User</option>
              <option value="DEPT_HEAD">Department Head</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {/* status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {error && <p className="text-red-600 text-center text-sm">{error}</p>}

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {isSubmitting ? 'Updating...' : 'Update User'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
