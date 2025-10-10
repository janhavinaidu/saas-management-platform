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

// Define the shape of the props this modal receives
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

  // Update form data when user prop changes
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
      // Call the backend API to update the user
      const response = await fetchWithAuth(
        `http://127.0.0.1:8000/api/users/${user.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            department: formData.department,
            role: formData.role,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user');
      }

      const responseData = await response.json();
      
      // Update the local state with the response from backend
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-gray-900">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Update the user details below.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" 
              name="username" 
              id="username" 
              value={formData.username}
              onChange={handleInputChange}
              required 
              disabled
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={formData.email}
              onChange={handleInputChange}
              required 
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
            <input 
              type="text" 
              name="department" 
              id="department" 
              value={formData.department}
              onChange={handleInputChange}
              required 
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select 
              name="role" 
              id="role" 
              value={formData.role}
              onChange={handleInputChange}
              required 
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
            >
              <option value="USER">User</option>
              <option value="DEPT_HEAD">Department Head</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select 
              name="status" 
              id="status" 
              value={formData.status}
              onChange={handleInputChange}
              required 
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label htmlFor="licenses" className="block text-sm font-medium text-gray-700">Number of Licenses</label>
            <input 
              type="number" 
              name="licenses" 
              id="licenses" 
              min="0" 
              value={formData.licenses}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
            />
          </div>
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
              {isSubmitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
