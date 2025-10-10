'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';

// --- TYPE DEFINITIONS ---
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

// --- PROPS TYPE ---
type AllUsersTableProps = {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
};

// --- HELPER COMPONENTS ---
const UserAvatar = ({ name }: { name: string }) => {
  const initials = name.split(/[\s._]+/).map(n => n[0]).join('').substring(0, 2).toUpperCase();
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


export default function AllUsersTable({ users, onEditUser, onDeleteUser }: AllUsersTableProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Effect to close the dropdown menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-bold text-xl text-gray-800 mb-4">All Users</h3>
      {users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No users found</p>
          <p className="text-gray-400 text-sm mt-2">Add your first user using the "Add User" button above</p>
        </div>
      ) : (
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <UserAvatar name={user.username} />
                      <div className="ml-4">
                        <div className="font-semibold text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.department}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.role}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-800">{user.licenses}</td>
                  <td className="py-3 px-4"><StatusTag status={user.status} /></td>
                  <td className="py-3 px-4 text-sm text-gray-600">{user.lastActive}</td>
                  <td className="py-3 px-4 text-right relative">
                    {/* --- THE 3-DOTS BUTTON --- */}
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} 
                      className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {/* --- THE DROPDOWN MENU --- */}
                    {openMenuId === user.id && (
                      <div ref={menuRef} className="absolute right-0 top-10 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                        <ul className="py-1">
                          <li>
                            <button 
                              onClick={() => { onEditUser(user); setOpenMenuId(null); }} 
                              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <Edit size={14} className="mr-2" /> Edit
                            </button>
                          </li>
                          <li>
                            <button 
                              onClick={() => { onDeleteUser(user); setOpenMenuId(null); }} 
                              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} className="mr-2" /> Delete
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
