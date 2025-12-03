'use client';

import { useState, useEffect } from 'react';
// Corrected import paths to be relative
import RequestLicenseModal from './RequestLicenseModal';
import AddTeamMemberModal from './AddTeamMemberModal';
import { Plus } from 'lucide-react';
import { fetchWithAuth } from '../../services/apiClient';

// --- TYPE DEFINITIONS ---
type License = { id: number; name: string };
// This is the User type as it exists in THIS component (matching the backend)
type User = { 
    id: number; 
    username: string; 
    email: string; 
    role: string; 
    department: string;
    licenses: License[];
};

const getTagColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800',
    'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800',
    'bg-pink-100 text-pink-800', 'bg-indigo-100 text-indigo-800',
  ];
  return colors[Math.abs(hash % colors.length)];
};

export default function DepartmentUserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [softwareToRevoke, setSoftwareToRevoke] = useState<License | null>(null);

  const fetchTeam = async () => {
      setIsLoading(true);
      setError('');
      try {
          const response = await fetchWithAuth('/api/department-team/');
          if (!response.ok) throw new Error('Failed to fetch team members.');
          const data = await response.json();
          // Backend now returns users with their licenses already included
          setUsers(data);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // Handler functions
  const handleOpenGrantModal = (user: User) => {
    setSelectedUser(user);
    setSoftwareToRevoke(null);
    setIsRequestModalOpen(true);
  };
  const handleOpenRevokeModal = (user: User, license: License) => {
    setSelectedUser(user);
    setSoftwareToRevoke(license);
    setIsRequestModalOpen(true);
  };
  const handleRequestSuccess = (userId: number, licenseName: string) => { 
    setUsers(currentUsers =>
      currentUsers.map(user => {
        if (user.id === userId) {
          return { ...user, licenses: user.licenses.filter(l => l.name !== licenseName) };
        }
        return user;
      })
    );
  };
  const handleAddMemberSuccess = () => { fetchTeam(); };

  if (isLoading) return <div className="text-center p-8 text-gray-500">Loading team members...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="font-bold text-xl text-gray-900">Team Members</h3>
                <p className="text-sm text-gray-500">Manage licenses for your department team</p>
            </div>
            <button 
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
            </button>
        </div>
        <div className="divide-y divide-gray-200 mt-4">
            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No team members found.</p>
                <p className="text-sm mt-1">Add team members to get started.</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center px-4 py-3 hover:bg-gray-50">
                  <div className="w-1/3">
                    <div className="font-medium text-gray-800">{user.username}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                  <div className="w-2/5">
                      <div className="flex flex-wrap items-center gap-2">
                          {user.licenses && user.licenses.length > 0 ? (
                            user.licenses.map((license) => (
                              <div key={license.id} className={`flex items-center rounded-md ${getTagColor(license.name)}`}>
                                  <span className="pl-2.5 pr-1.5 py-1 text-xs font-semibold">{license.name}</span>
                                  <button
                                      onClick={() => handleOpenRevokeModal(user, license)}
                                      className="text-red-500/70 hover:text-red-700 text-sm font-bold p-1 rounded-full hover:bg-red-200/50 transition-colors"
                                      title={`Request to revoke ${license.name}`}
                                  >&times;</button>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">No licenses assigned</span>
                          )}
                      </div>
                  </div>
                  <div className="w-1/4 text-right">
                      <button onClick={() => handleOpenGrantModal(user)} className="flex items-center ml-auto px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700">
                          <Plus className="h-3 w-3 mr-1.5" />
                          Request License
                      </button>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>

      <RequestLicenseModal 
        isOpen={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        onSubmitSuccess={handleRequestSuccess} 
        user={selectedUser ? { ...selectedUser, name: selectedUser.username } : null}
        softwareToRevoke={softwareToRevoke} 
      />

      <AddTeamMemberModal 
        isOpen={isAddMemberModalOpen} 
        onClose={() => setIsAddMemberModalOpen(false)} 
        onSuccess={handleAddMemberSuccess} 
      />
    </>
  );
}

