'use client';

import { Search, Bell, Plus, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define the shape of the props this component expects.
// It needs a function to call when the "Add License" button is clicked.
type NavbarProps = {
  onAddLicenseClick: () => void;
};

export default function Navbar({ onAddLicenseClick }: NavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem('lastAccessToken');
    
    // Redirect to login
    router.push('/login');
  };

  return (
    <header className="h-16 flex items-center px-6 bg-white border-b border-gray-200 flex-shrink-0">
      {/* The main content of the navbar is pushed to the right */}
      <div className="flex items-center space-x-4 ml-auto">
        
        {/* Search Button */}
        <button className="text-black hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
          <Search size={20} />
        </button>

        {/* Notifications Button */}
        <button className="text-black hover:text-gray-800 p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
        </button>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
       
      </div>
    </header>
  );
}

