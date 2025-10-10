'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../services/apiClient';

// Define the shape of the props this modal receives
type AddTeamMemberModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
};

export default function AddTeamMemberModal({ isOpen, onClose, onSuccess }: AddTeamMemberModalProps) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserDepartment, setCurrentUserDepartment] = useState<string>('');

  // Fetch the current user's department when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCurrentUserProfile();
    }
  }, [isOpen]);

  const fetchCurrentUserProfile = async () => {
    try {
      const response = await fetchWithAuth('http://127.0.0.1:8000/api/profile/');
      if (response.ok) {
        const profile = await response.json();
        // The profile endpoint now returns department
        if (profile.department) {
          setCurrentUserDepartment(profile.department);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!currentUserDepartment) {
      setError('You must have a department assigned to add team members.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const username = (formData.get('fullName') as string).toLowerCase().replace(/\s+/g, '.');
    const email = formData.get('email') as string;
    
    // Generate a temporary password (in production, you'd send an invite email)
    const tempPassword = 'TempPass123!';

    const payload = {
      username: username,
      email: email,
      password: tempPassword,
      department: currentUserDepartment,
      role: 'USER', 
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Backend will return specific error messages for duplicate users
        throw new Error(errorData.detail || 'Failed to add team member');
      }

      console.log("Team member added successfully to department:", currentUserDepartment);
      onSuccess(); // This will refresh the team list
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add New Team Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Enter the details for the new team member below. They will be added to your department.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" name="fullName" id="fullName" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Work Email Address</label>
              <input type="email" name="email" id="email" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
