'use client';

import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../services/apiClient';

// --- TYPE DEFINITIONS ---
type SoftwareItem = {
  id: number;
  name: string;
  vendor: string;
  category: string;
  total_licenses: number;
  monthly_cost: string;
  renewal_date: string;
  description?: string;
};

type AddSoftwareModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: SoftwareItem | null;
};

export default function AddSoftwareModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddSoftwareModalProps) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!initialData;

  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormKey((k) => k + 1);
      setError('');
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

    // CORRECTED URLs → now relative!
    const endpoint = isEditMode
      ? `/api/saas-applications/${initialData?.id}/`
      : `/api/saas-applications/create/`;

    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetchWithAuth(endpoint, {
        method: method,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          Object.values(errorData).flat().join(' ') ||
            `Failed to ${isEditMode ? 'update' : 'add'} software.`
        );
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save software.');
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Software' : 'Add New Software'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          {isEditMode
            ? 'Update the details for this software license.'
            : 'Add a new software license to your inventory.'}
        </p>

        <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Software Name</label>
              <input
                type="text"
                name="softwareName"
                defaultValue={initialData?.name}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Vendor</label>
              <input
                type="text"
                name="vendor"
                defaultValue={initialData?.vendor}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                name="category"
                defaultValue={initialData?.category}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select</option>
                <option value="Productivity">Productivity</option>
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Communication">Communication</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Total Licenses</label>
              <input
                type="number"
                name="totalLicenses"
                defaultValue={initialData?.total_licenses}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Monthly Cost ($)</label>
              <input
                type="number"
                step="0.01"
                name="monthlyCost"
                defaultValue={initialData?.monthly_cost}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Renewal Date</label>
              <input
                type="date"
                name="renewalDate"
                defaultValue={initialData?.renewal_date}
                className="mt-1 w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              defaultValue={initialData?.description}
              rows={3}
              className="mt-1 w-full px-3 py-2 border rounded-md"
            ></textarea>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-400"
            >
              {isSubmitting
                ? isEditMode
                  ? 'Saving...'
                  : 'Adding...'
                : isEditMode
                ? 'Save Changes'
                : 'Add License'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
