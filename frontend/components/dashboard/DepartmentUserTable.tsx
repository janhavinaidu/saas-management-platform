'use client';

import { useState } from 'react';
// Corrected the import path to be relative, which is more reliable.
import RequestLicenseModal from './RequestLicenseModal';
import { Plus } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type License = { id: number; name: string };
type User = { id: number; name: string; email: string; role: string; licenses: License[] };

// --- MOCK DATA ---
const initialDepartmentUsers: User[] = [
  { id: 101, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'Designer', licenses: [{ id: 1, name: 'Microsoft Office' }, { id: 2, name: 'Slack' }, { id: 8, name: 'Figma' }] },
  { id: 102, name: 'Mike Chen', email: 'mike.chen@company.com', role: 'Developer', licenses: [{ id: 1, name: 'Microsoft Office' }, { id: 2, name: 'Slack' }, { id: 9, name: 'Adobe Creative' }, { id: 7, name: 'Jira' }] },
  { id: 103, name: 'Emily Rodriguez', email: 'emily.rodriguez@company.com', role: 'Marketer', licenses: [{ id: 1, name: 'Microsoft Office' }, { id: 8, name: 'Figma' }, { id: 10, name: 'Notion' }] },
  { id: 104, name: 'David Park', email: 'david.park@company.com', role: 'Developer', licenses: [{ id: 1, name: 'Microsoft Office' }, { id: 2, name: 'Slack' }, { id: 11, name: 'GitHub' }, { id: 3, name: 'VS Code' }] },
  { id: 105, name: 'Lisa Wang', email: 'lisa.wang@company.com', role: 'Designer', licenses: [{ id: 1, name: 'Microsoft Office' }, { id: 9, name: 'Adobe Creative' }, { id: 12, name: 'Sketch' }] },
];

// --- HELPER FUNCTION FOR COLORED TAGS ---
const getTagColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-gray-200 text-gray-800',
  ];
  return colors[Math.abs(hash % colors.length)];
};


export default function DepartmentUserTable() {
  const [users, setUsers] = useState(initialDepartmentUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [softwareToRevoke, setSoftwareToRevoke] = useState<License | null>(null);

  const handleOpenGrantModal = (user: User) => {
    setSelectedUser(user);
    setSoftwareToRevoke(null);
    setIsModalOpen(true);
  };

  const handleOpenRevokeModal = (user: User, license: License) => {
    setSelectedUser(user);
    setSoftwareToRevoke(license);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSoftwareToRevoke(null);
  };

  const handleRequestSuccess = (userId: number, licenseName: string) => {
    setUsers(currentUsers =>
      currentUsers.map(user => {
        if (user.id === userId) {
          const updatedLicenses = user.licenses.filter(license => license.name !== licenseName);
          return { ...user, licenses: updatedLicenses };
        }
        return user;
      })
    );
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-xl text-gray-900">Team Members</h3>
            <p className="text-sm text-gray-500">Manage licenses for your department team</p>
          </div>
          <button className="flex items-center px-5 py-3 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Team Member
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center px-4 py-2 bg-gray-50 rounded-md text-sm font-medium text-gray-600">
            <div className="w-1/3">Member Name & Email</div>
            <div className="w-1/3">Assigned Licenses</div>
            <div className="w-1/3 text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="flex items-center px-4 py-3 hover:bg-gray-50">
                <div className="w-1/3">
                  <div className="font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="w-1/3">
                  <div className="flex flex-wrap items-center gap-2">
                    {user.licenses.map((license) => (
                       <div key={license.id} className={`flex items-center rounded-md ${getTagColor(license.name)}`}>
                         <span className="pl-2.5 pr-1.5 py-1 text-xs font-semibold">
                           {license.name}
                         </span>
                         <button
                           onClick={() => handleOpenRevokeModal(user, license)}
                           className="text-red-500/70 hover:text-red-700 text-sm font-bold p-1 rounded-full hover:bg-red-200/50 transition-colors"
                           title={`Request to revoke ${license.name}`}
                         >
                           &times;
                         </button>
                       </div>
                    ))}
                  </div>
                </div>
                <div className="w-1/3 text-right">
                  <button
                    onClick={() => handleOpenGrantModal(user)}
                    className="flex items-center ml-auto px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Request License
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RequestLicenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmitSuccess={handleRequestSuccess}
        user={selectedUser}
        softwareToRevoke={softwareToRevoke}
      />
    </>
  );
}

