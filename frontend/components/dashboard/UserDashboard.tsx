'use client';

import { useState, useEffect } from 'react';
import { Plus, MessageSquareWarning, CalendarDays, Info } from 'lucide-react';
import { fetchWithAuth } from '@/services/apiClient';
import UserRequestLicenseModal from './UserRequestLicenseModal';
import ReportIssueModal from './ReportIssueModal';

// --- TYPE DEFINITIONS ---
type AssignedLicense = {
  id: number;
  name: string;
  category: string;
  renewal_date: string;
  description: string;
  vendor?: string;
};

// --- HELPER FUNCTIONS ---
// Generates a consistent color for each category tag.
const getTagColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    Design: 'bg-blue-100 text-blue-800',
    Communication: 'bg-green-100 text-green-800',
    Productivity: 'bg-purple-100 text-purple-800',
    Development: 'bg-orange-100 text-orange-800',
    Other: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

// Checks if a license has expired based on the renewal date.
const isExpired = (renewalDate: string): boolean => {
  const renewal = new Date(renewalDate);
  const today = new Date();
  return renewal < today;
};

export default function UserDashboard() {
  const [userName, setUserName] = useState<string>('');
  const [userDepartment, setUserDepartment] = useState<string>('');
  const [userLicenses, setUserLicenses] = useState<AssignedLicense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);

  // Fetch user profile and allocated licenses
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await fetchWithAuth('/api/profile/');

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUserName(profileData.username || 'User');
          setUserDepartment(profileData.department || 'No Department');
        }

        // Fetch allocated licenses
        const licensesResponse = await fetchWithAuth('/api/user-licenses/');

        if (licensesResponse.ok) {
          const licensesData = await licensesResponse.json();
          setUserLicenses(licensesData.licenses || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleRequestSuccess = () => {
    // Refresh the license list
    alert('License request submitted successfully! Your department head will review it.');
    // Optionally refetch licenses here
  };

  const handleReportIssueSuccess = () => {
    alert('Issue reported successfully! Your department head will be notified.');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading your licenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-900">
      {/* Header Section */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Hi {userName}</h2>
        <p className="text-black">
          {userDepartment && userDepartment !== 'No Department' 
            ? `${userDepartment} Department • Manage and track your licensed software applications`
            : 'Manage and track your licensed software applications'
          }
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button 
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center px-5 py-3 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Request New License
        </button>
        <button 
          onClick={() => setIsReportIssueModalOpen(true)}
          className="flex items-center px-5 py-3 bg-amber-600 text-white text-base font-semibold rounded-lg hover:bg-amber-700 transition-colors"
        >
          <MessageSquareWarning className="h-5 w-5 mr-2" />
          Report Issue
        </button>
      </div>
      
      {/* License Cards Grid */}
      {userLicenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg">No licenses allocated yet.</p>
          <p className="text-gray-500 text-sm mt-2">Request a new license to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
          {userLicenses.map((license) => {
            const expired = isExpired(license.renewal_date);
            return (
              <div key={license.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">{license.name}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getTagColor(license.category)}`}>
                      {license.category}
                    </span>
                  </div>
                  <p className="text-sm text-black mb-4 h-16">
                    {license.description || 'No description available'}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-black">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      <span>Renewal: {new Date(license.renewal_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    {expired && (
                      <div className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-md">
                        <Info className="h-4 w-4 mr-1.5" />
                        <span className="text-xs font-bold">Expired</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setIsReportIssueModalOpen(true)}
                    className="w-full flex justify-center items-center py-2 bg-gray-50 text-black text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-100"
                  >
                    <MessageSquareWarning className="h-4 w-4 mr-2" />
                    Report Issue
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request License Modal */}
      <UserRequestLicenseModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={handleRequestSuccess}
      />

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={isReportIssueModalOpen}
        onClose={() => setIsReportIssueModalOpen(false)}
        onSuccess={handleReportIssueSuccess}
        userLicenses={userLicenses.map(license => ({
          id: license.id,
          name: license.name,
          category: license.category,
          renewalDate: license.renewal_date,
          description: license.description
        }))}
      />
    </div>
  );
}

