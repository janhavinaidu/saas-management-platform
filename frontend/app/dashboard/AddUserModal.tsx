'use client';

import { useState } from 'react';

// Define the shape of the props this modal receives
type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: { name: string; email: string; department: string; role: string; password: string; licenses: number }) => void;
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
    const payload = {
      name: formData.get('fullName') as string,
      email: formData.get('email') as string,
      department: formData.get('department') as string,
      role: formData.get('role') as string,
      password: formData.get('password') as string,
      licenses: parseInt(formData.get('licenses') as string) || 0,
    };

    // Add the user to the state
    onAddUser(payload);
    
    setIsSubmitting(false);
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-gray-900">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Enter the details for the new user account below.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="fullName" id="fullName" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" name="email" id="email" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/>
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <input type="text" name="department" id="department" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select name="role" id="role" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900">
                <option value="USER">User</option>
                <option value="DEPT_HEAD">Department Head</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Temporary Password</label>
              <input type="password" name="password" id="password" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/>
            </div>
            <div>
              <label htmlFor="licenses" className="block text-sm font-medium text-gray-700">Number of Licenses</label>
              <input 
                type="number" 
                name="licenses" 
                id="licenses" 
                min="0" 
                defaultValue="0"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"
              />
            </div>
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
              {isSubmitting ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
