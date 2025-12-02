'use client';

import { useState, useEffect } from 'react';
// Corrected the import path to be relative to fix the resolution error.
import { fetchWithAuth } from '../../services/apiClient';

// --- TYPE DEFINITIONS ---
// This defines the shape of the software data, including the optional 'description'
type SoftwareItem = {
  id: number;
  name: string;
  vendor: string;
  category: string;
  total_licenses: number;
  monthly_cost: string;
  renewal_date: string;
  description?: string; // Description is optional
};

// Define the shape of the props this modal receives
type AddSoftwareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // A callback to refresh the inventory table
  initialData?: SoftwareItem | null; // This new prop enables "Edit Mode"
};

export default function AddSoftwareModal({ isOpen, onClose, onSuccess, initialData }: AddSoftwareModalProps) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  // We use a key to force re-rendering of the form when initialData changes
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    // When the modal opens, reset the form by changing its key
    if (isOpen) {
      setFormKey(prevKey => prevKey + 1);
      setError(''); // Also clear any previous errors
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('softwareName'),
      vendor: formData.get('vendor'),
      category: formData.get('category'),
      total_licenses: Number(formData.get('totalLicenses')),
      monthly_cost: formData.get('monthlyCost'),
      renewal_date: formData.get('renewalDate'),
      description: formData.get('description'),
    };

    // --- DYNAMIC API LOGIC ---
    // The URL and method change based on whether we are in "Edit Mode"
    const url = isEditMode
      ? `http://127.0.0.1:8000/api/saas-applications/${initialData.id}/`
      : `http://127.0.0.1:8000/api/saas-applications/create/`;
      
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetchWithAuth(url, {
        method: method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(Object.values(errorData).flat().join(' ') || `Failed to ${isEditMode ? 'update' : 'add'} software.`);
      }
      
      onSuccess(); // Call the success callback to refresh the parent table
      onClose();   // Close the modal

    } catch (err: any) {
      setError(err.message);
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Edit Software' : 'Add New Software'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          {isEditMode ? 'Update the details for this software license.' : 'Add a new software license to your inventory.'}
        </p>
        
        <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="softwareName" className="block text-sm font-medium text-gray-700">Software Name</label>
              <input type="text" name="softwareName" id="softwareName" defaultValue={initialData?.name} placeholder="e.g., Microsoft Office 365" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/>
            </div>
            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Vendor</label>
              <input type="text" name="vendor" id="vendor" defaultValue={initialData?.vendor} placeholder="e.g., Microsoft Corporation" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" id="category" defaultValue={initialData?.category} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900">
                <option value="">Select a category</option>
                <option value="Productivity">Productivity</option>
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Communication">Communication</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
            <div>
              <label htmlFor="totalLicenses" className="block text-sm font-medium text-gray-700">Total Licenses</label>
              <input type="number" name="totalLicenses" id="totalLicenses" defaultValue={initialData?.total_licenses} placeholder="100" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/>
            </div>
            <div>
              <label htmlFor="monthlyCost" className="block text-sm font-medium text-gray-700">Monthly Cost ($)</label>
              <input type="number" step="0.01" name="monthlyCost" id="monthlyCost" defaultValue={initialData?.monthly_cost} placeholder="1500.00" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"/>
            </div>
            <div>
              <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-700">Renewal Date</label>
              <input type="date" name="renewalDate" id="renewalDate" defaultValue={initialData?.renewal_date} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"/>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" id="description" rows={3} defaultValue={initialData?.description} placeholder="Brief description of the software and its use case..." className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"></textarea>
          </div>
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
              {isSubmitting ? (isEditMode ? 'Saving...' : 'Adding...') : (isEditMode ? 'Save Changes' : 'Add License')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

