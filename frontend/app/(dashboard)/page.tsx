'use client';

import { useState, useEffect } from 'react';

// Import all three of our dashboard components using relative paths
import AdminDashboard from '../../components/dashboard/AdminDashboard';
import DeptHeadDashboard from '../../components/dashboard/DeptHeadDashboard';
import UserDashboard from '../../components/dashboard/UserDashboard';

// Define the shape of the user profile we expect from the backend
type UserProfile = {
  username: string;
  email: string;
  role: 'ADMIN' | 'DEPT_HEAD' | 'USER';
};

/**
 * This component acts as a "router" for the main dashboard page.
 * It gets the user's role from the layout and displays the correct dashboard.
 */
export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the profile from localStorage (set by the layout)
    const storedProfile = localStorage.getItem('userProfile');
    console.log('Dashboard page - storedProfile from localStorage:', storedProfile);
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      console.log('Dashboard page - parsed profile:', parsedProfile);
      setProfile(parsedProfile);
      setIsLoading(false);
    } else {
      console.log('Dashboard page - No profile found in localStorage, waiting...');
      // If no profile found, wait a bit and try again
      const timeout = setTimeout(() => {
        const retryProfile = localStorage.getItem('userProfile');
        if (retryProfile) {
          const parsedProfile = JSON.parse(retryProfile);
          console.log('Dashboard page - retry found profile:', parsedProfile);
          setProfile(parsedProfile);
        }
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  // Add a refresh mechanism to re-fetch profile if needed
  useEffect(() => {
    const handleProfileReady = (event: CustomEvent) => {
      console.log('Dashboard page - Profile ready event received:', event.detail);
      setProfile(event.detail);
      setIsLoading(false);
    };

    const handleStorageChange = () => {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        console.log('Dashboard page - Profile updated from storage:', parsedProfile);
        setProfile(parsedProfile);
        setIsLoading(false);
      }
    };

    // Listen for the custom profile ready event
    window.addEventListener('profileReady', handleProfileReady as EventListener);
    
    // Listen for storage changes (when layout updates the profile)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case of race conditions
    const interval = setInterval(() => {
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile && !profile) {
        const parsedProfile = JSON.parse(storedProfile);
        console.log('Dashboard page - Profile found on interval check:', parsedProfile);
        setProfile(parsedProfile);
        setIsLoading(false);
      }
    }, 1000);

    return () => {
      window.removeEventListener('profileReady', handleProfileReady as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [profile]);

  // Function to manually refresh profile
  const refreshProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const response = await fetch('http://127.0.0.1:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userProfile = await response.json();
        console.log('Dashboard page - Refreshed profile from API:', userProfile);
        setProfile(userProfile);
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  // Show loading state while waiting for profile
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // This is the core logic: render the correct dashboard based on the fetched role.
  console.log('Dashboard page - Current profile role:', profile?.role);
  

  switch (profile?.role) {
    case 'ADMIN':
      console.log('Dashboard page - Rendering AdminDashboard');
      return <AdminDashboard />;
    case 'DEPT_HEAD':
      console.log('Dashboard page - Rendering DeptHeadDashboard');
      return <DeptHeadDashboard />;
    case 'USER':
      console.log('Dashboard page - Rendering UserDashboard');
      return <UserDashboard />;
    default:
      // Fallback for an unknown role or if the profile is somehow null.
      console.log('Dashboard page - No matching role, showing fallback');
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Dashboard Available</h2>
          <p className="text-gray-600 mb-4">No dashboard available for your role: <strong>{profile?.role || 'null'}</strong></p>
          <button 
            onClick={refreshProfile}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Profile
          </button>
        </div>
      );
  }
}

