'use client';

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
// Corrected the import paths to be relative to fix the resolution error.
import AllUsersTable from '../../dashboard/AllUsersTable';
import AddUserModal from '../../dashboard/AddUserModal';
import EditUserModal from '../../dashboard/EditUserModal';
import DeleteConfirmationModal from '../../../components/dashboard/DeleteConfirmationModal';

// Define the User type
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

// A local component for the stat cards specific to this page's design.
const StatCard = ({ title, value, bgColor, textColor }: { title: string, value: string, bgColor: string, textColor: string }) => (
  <div className={`p-5 rounded-lg border border-gray-200 shadow-sm ${bgColor}`}>
    <p className="text-sm text-gray-600">{title}</p>
    <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
  </div>
);

export default function UsersPage() {
  // --- STATE FOR THE MODALS ---
  // This state variable will control whether the "Add User" modal is visible.
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  
  // --- STATE FOR USERS ---
  // This state will manage the list of users - starting with empty array
  const [users, setUsers] = useState<User[]>([]);

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        console.log('Loaded users from localStorage:', parsedUsers);
        setUsers(parsedUsers);
      } catch (error) {
        console.error('Failed to parse saved users:', error);
        setUsers([]);
      }
    } else {
      console.log('No saved users found in localStorage');
    }
  }, []);

  // Save users to localStorage whenever users state changes
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Saved users to localStorage:', users);
    }
  }, [users]);

  // Function to add a new user
  const addUser = (newUser: Omit<User, 'id' | 'status' | 'lastActive'>) => {
    const user: User = {
      ...newUser,
      id: Math.max(...users.map(u => u.id), 0) + 1, // Generate new ID
      status: 'active', // New users are active by default
      lastActive: 'Just now'
    };
    setUsers(prevUsers => [...prevUsers, user]);
  };

  // Function to edit a user
  const editUser = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  // Function to delete a user
  const deleteUser = (userToDelete: User) => {
    setUsers(prevUsers => 
      prevUsers.filter(user => user.id !== userToDelete.id)
    );
  };

  // Handler functions for the table actions
  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
  };

  return (
    <>
      <div className="flex-1 space-y-6 p-4 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Users</h2>
            <p className="text-gray-500">Manage user accounts and license assignments</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-48 border border-gray-300 rounded-md text-sm"
              />
            </div>
            {/* This button's onClick handler now sets the state to true, opening the modal. */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Stat Cards Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Users" value={users.length.toString()} bgColor="bg-white" textColor="text-gray-900" />
          <StatCard title="Active Users" value={users.filter(user => user.status === 'active').length.toString()} bgColor="bg-white" textColor="text-green-600" />
          <StatCard title="Inactive Users" value={users.filter(user => user.status === 'inactive').length.toString()} bgColor="bg-white" textColor="text-red-600" />
          <StatCard title="Pending Approval" value="0" bgColor="bg-white" textColor="text-yellow-600" />
        </div>

        {/* All Users Table Section */}
        <div>
          <AllUsersTable 
            users={users} 
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      </div>

      {/* The Modal Components */}
      <AddUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddUser={addUser}
      />
      
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onEditUser={editUser}
        user={editingUser}
      />
      
      <DeleteConfirmationModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => {
          if (deletingUser) {
            deleteUser(deletingUser);
            setDeletingUser(null);
          }
        }}
        itemName={deletingUser?.name || ''}
      />
    </>
  );
}

