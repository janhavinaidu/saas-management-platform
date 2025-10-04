'use client';

import { MoreHorizontal } from 'lucide-react';

// --- TYPE DEFINITIONS ---
type User = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  licenses: number;
  status: 'active' | 'inactive';
  lastActive: string;
};

// --- MOCK DATA ---
const mockUsers: User[] = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', department: 'Engineering', role: 'Senior Developer', licenses: 8, status: 'active', lastActive: '2 hours ago' },
  { id: 2, name: 'Michael Chen', email: 'michael.chen@company.com', department: 'Marketing', role: 'Marketing Manager', licenses: 5, status: 'active', lastActive: '1 day ago' },
  { id: 3, name: 'Emily Rodriguez', email: 'emily.rodriguez@company.com', department: 'Sales', role: 'Sales Representative', licenses: 3, status: 'inactive', lastActive: '1 week ago' },
  { id: 4, name: 'David Park', email: 'david.park@company.com', department: 'Engineering', role: 'Frontend Developer', licenses: 6, status: 'active', lastActive: '3 hours ago' },
  { id: 5, name: 'Jessica Miller', email: 'jessica.miller@company.com', department: 'Product', role: 'Product Manager', licenses: 7, status: 'active', lastActive: '5 hours ago' },
];

// --- HELPER COMPONENTS ---
const UserAvatar = ({ name }: { name: string }) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  // A simple hash function to get a consistent color
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const colors = ['bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800', 'bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-pink-100 text-pink-800'];
  const color = colors[Math.abs(hash % colors.length)];
  
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${color}`}>
      {initials}
    </div>
  );
};

const StatusTag = ({ status }: { status: User['status'] }) => {
  const style = status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${style}`}>{status}</span>;
};


export default function AllUsersTable() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-bold text-xl text-gray-800 mb-4">All Users</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Licenses</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Last Active</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <UserAvatar name={user.name} />
                    <div className="ml-4">
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{user.department}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{user.role}</td>
                <td className="py-3 px-4 text-sm font-semibold text-gray-800">{user.licenses}</td>
                <td className="py-3 px-4"><StatusTag status={user.status} /></td>
                <td className="py-3 px-4 text-sm text-gray-600">{user.lastActive}</td>
                <td className="py-3 px-4 text-right">
                  <button className="text-gray-400 hover:text-gray-700"><MoreHorizontal size={20} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
