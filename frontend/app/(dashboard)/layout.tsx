'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AddSoftwareModal from '../dashboard/AddSoftwareModal';

// Define the shape of the user profile we expect from the backend
type UserProfile = {
  username: string;
  email: string;
  role: 'ADMIN' | 'DEPT_HEAD' | 'USER';
};

/*
 * This is the layout for the protected dashboard section. It's the "frame" that
 * holds the sidebar, navbar, and the actual page content.
 *
 * By managing the modal's state here, we make the "Add License" button
 * in the navbar work globally across all dashboard pages.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- STATE MANAGEMENT FOR THE GLOBAL MODAL ---
  // This state controls whether the "Add Software" modal is visible.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // This function will be called when the modal successfully adds new software.
  // In a real application, this would trigger a re-fetch of data.
  const handleAddSuccess = () => {
    console.log("New software added! The layout should now refresh the relevant data.");
    // Example: queryClient.invalidateQueries('inventory');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Get the authentication token from localStorage.
      const token = localStorage.getItem('accessToken');

      // 2. If no token is found, the user is not logged in. Redirect them.
      if (!token) {
        router.push('/login');
        return;
      }

      // Check if this is a new user session by comparing tokens
      const lastToken = sessionStorage.getItem('lastAccessToken');
      if (lastToken !== token) {
        console.log('Layout - New user session detected, clearing cache');
        localStorage.removeItem('userProfile');
        sessionStorage.setItem('lastAccessToken', token);
      }

      // 3. Always fetch fresh profile data to ensure correct user role
      // This prevents issues with cached profiles from previous users
      console.log('Layout - Always fetching fresh profile data');

      try {
        // 4. Make a secure API call to the backend's /api/profile/ endpoint.
        const response = await fetch('http://127.0.0.1:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the request header
          },
        });

        if (!response.ok) {
          // If the token is invalid or expired, the backend will return an error.
          throw new Error('Authentication failed. Please log in again.');
        }

        const userProfile: UserProfile = await response.json();
        console.log('Layout - API response userProfile:', userProfile);
        
        // 5. On success, save the user's profile to our state and localStorage.
        setProfile(userProfile);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        console.log('Layout - Saved profile to localStorage:', userProfile);
        
        // Dispatch a custom event to notify other components that profile is ready
        window.dispatchEvent(new CustomEvent('profileReady', { detail: userProfile }));

      } catch (err: any) {
        console.error("Failed to fetch profile:", err);
        setError(err.message);
        // On failure (e.g., bad token), clear the old token and redirect to login.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userProfile');
        sessionStorage.removeItem('lastAccessToken');
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []); // Empty dependency array - only run once on mount

  // While we are fetching the user's role, show a minimal loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
            <div className="space-y-4">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // If profile is not loaded yet, show loading
  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If there was an error, display it.
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  // Determine if sidebar should be shown (only for ADMIN role)
  const shouldShowSidebar = profile?.role === 'ADMIN';
  console.log('Layout - Profile role:', profile?.role, 'Should show sidebar:', shouldShowSidebar);

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {shouldShowSidebar && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* We pass the function to open the modal down to the Navbar */}
          <Navbar onAddLicenseClick={() => setIsModalOpen(true)} />
          
          {/* The 'children' here will be the specific page you are on (e.g., Inventory, Users) */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* The Modal Component is rendered here at the layout level.
        It is controlled by the state defined in this component.
      */}
      <AddSoftwareModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}

