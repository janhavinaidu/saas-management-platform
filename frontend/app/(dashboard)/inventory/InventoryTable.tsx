'use client';

import { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
// Corrected the import path to be relative to fix the resolution error.
import { fetchWithAuth } from '../../../services/apiClient';
import AddSoftwareModal from '../../dashboard/AddSoftwareModal';
import DeleteConfirmationModal from '../../../components/dashboard/DeleteConfirmationModal';

// --- TYPE DEFINITIONS ---
type SoftwareItem = {
  id: number;
  name: string;
  vendor: string;
  category: string;
  total_licenses: number;
  monthly_cost: string;
  renewal_date: string;
};

// --- HELPER FUNCTIONS ---

// Calculates the status of a license based on its renewal date.
const getStatus = (renewalDate: string): 'active' | 'expiring' | 'expired' => {
    const renewal = new Date(renewalDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (renewal < today) return 'expired';
    if (renewal < thirtyDaysFromNow) return 'expiring';
    return 'active';
};

// --- THIS IS THE RESTORED HELPER COMPONENT ---
// It now correctly applies colors based on the status.
const StatusTag = ({ status }: { status: 'active' | 'expiring' | 'expired' }) => {
  const styles = {
    active: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    expiring: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    expired: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  };
  const style = styles[status];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 mr-2 rounded-full ${style.dot}`}></span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};


export default function InventoryTable() {
  const [inventory, setInventory] = useState<SoftwareItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- NEW STATE FOR INTERACTIVITY ---
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingSoftware, setEditingSoftware] = useState<SoftwareItem | null>(null);
  const [deletingSoftware, setDeletingSoftware] = useState<SoftwareItem | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await fetchWithAuth('http://127.0.0.1:8000/api/saas-applications/');

        if (!response.ok) {
          throw new Error('Failed to fetch inventory data.');
        }
        
        const data = await response.json();
        setInventory(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadInventory();
  }, []);

  // Effect to close the dropdown menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  // --- API HANDLER FOR DELETING SOFTWARE ---
  const handleDelete = async () => {
    if (!deletingSoftware) return;
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/api/saas-applications/${deletingSoftware.id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete software.');
      
      // Optimistic UI update: remove the item from the list instantly
      setInventory(prev => prev.filter(item => item.id !== deletingSoftware.id));
      setDeletingSoftware(null); // Close the confirmation modal
    } catch (err) {
      console.error(err);
      alert('Could not delete software. Please try again.');
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading inventory...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-bold text-xl text-gray-900 mb-4">Software Inventory</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Software</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Total Licenses</th>
                <th className="py-3 px-4">Monthly Cost</th>
                <th className="py-3 px-4">Renewal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.length > 0 ? (
                  inventory.map((item) => {
                    const status = getStatus(item.renewal_date);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.vendor}</div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{item.category}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">{item.total_licenses.toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm font-semibold text-gray-900">${parseFloat(item.monthly_cost).toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{item.renewal_date}</td>
                        <td className="py-4 px-4">
                          <StatusTag status={status} />
                        </td>
                        <td className="py-4 px-4 text-right relative">
                          {/* --- THE 3-DOTS BUTTON --- */}
                          <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200">
                            <MoreHorizontal size={20} />
                          </button>
                          {/* --- THE DROPDOWN MENU --- */}
                          {openMenuId === item.id && (
                            <div ref={menuRef} className="absolute right-0 top-10 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                              <ul className="py-1">
                                <li>
                                  <button onClick={() => { setEditingSoftware(item); setOpenMenuId(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Edit size={14} className="mr-2" /> Edit
                                  </button>
                                </li>
                                <li>
                                  <button onClick={() => { setDeletingSoftware(item); setOpenMenuId(null); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <Trash2 size={14} className="mr-2" /> Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                  <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                          No software found in inventory. Try adding some!
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* --- MODALS controlled by the table's state --- */}
      <AddSoftwareModal 
        isOpen={!!editingSoftware}
        onClose={() => setEditingSoftware(null)}
        onSuccess={() => {
          // Refresh the inventory data
          const loadInventory = async () => {
            setIsLoading(true);
            setError('');
            try {
              const response = await fetchWithAuth('http://127.0.0.1:8000/api/saas-applications/');
              if (!response.ok) throw new Error('Failed to fetch inventory data.');
              const data = await response.json();
              setInventory(data);
            } catch (err: any) {
              setError(err.message);
            } finally {
              setIsLoading(false);
            }
          };
          loadInventory();
        }}
        initialData={editingSoftware}
      />
      <DeleteConfirmationModal
        isOpen={!!deletingSoftware}
        onClose={() => setDeletingSoftware(null)}
        onConfirm={handleDelete}
        itemName={deletingSoftware?.name || ''}
      />
    </>
  );
}

