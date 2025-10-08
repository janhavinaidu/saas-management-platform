'use client';

import { useState } from 'react';
import { Plus, MessageSquareWarning, CalendarDays, Info } from 'lucide-react';
import UserRequestLicenseModal from './UserRequestLicenseModal';
import ReportIssueModal from './ReportIssueModal';

// --- TYPE DEFINITIONS ---
type AssignedLicense = {
  id: number;
  name: string;
  category: string;
  renewalDate: string;
  description: string;
};

// --- MOCK DATA ---
// We'll add renewal dates to our mock data to test the "Expired" logic.
const mockUserLicenses: AssignedLicense[] = [
  { id: 1, name: 'Adobe Creative Suite', category: 'Design', renewalDate: '2025-12-15', description: 'Complete creative toolkit for graphic design, video editing, and digital art creation.' },
  { id: 2, name: 'Slack Premium', category: 'Communication', renewalDate: '2024-11-30', description: 'Team collaboration and messaging platform for seamless workplace communication.' },
  { id: 3, name: 'Figma Professional', category: 'Design', renewalDate: '2025-01-20', description: 'Collaborative interface design tool for creating user experiences and prototypes.' },
  { id: 4, name: 'Notion Pro', category: 'Productivity', renewalDate: '2026-03-01', description: 'All-in-one workspace for notes, docs, wikis, and project management.' },
  { id: 5, name: 'Zoom Pro', category: 'Communication', renewalDate: '2025-08-22', description: 'Video conferencing and webinar platform for reliable online meetings.' },
  { id: 6, name: 'GitHub Enterprise', category: 'Development', renewalDate: '2025-06-10', description: 'Code hosting platform with version control and collaborative development features.' },
];

// --- HELPER FUNCTIONS ---
// Generates a consistent color for each category tag.
const getTagColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    Design: 'bg-blue-100 text-blue-800',
    Communication: 'bg-green-100 text-green-800',
    Productivity: 'bg-purple-100 text-purple-800',
    Development: 'bg-orange-100 text-orange-800',
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
  const userName = "John"; // This would be fetched from user data in a real app
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);

  const handleRequestSuccess = () => {
    // Refresh the license list or show success message
    alert('License request submitted successfully! Your department head will review it.');
  };

  const handleReportIssueSuccess = () => {
    alert('Issue reported successfully! Your department head will be notified.');
  };

  return (
    <div className="space-y-6 text-gray-900">
      {/* Header Section */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Hi {userName}</h2>
        <p className="text-black">Manage and track your licensed software applications</p>
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
      <div className="grid gap-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {mockUserLicenses.map((license) => {
          const expired = isExpired(license.renewalDate);
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
                  {license.description}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-black">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    <span>Renewal: {new Date(license.renewalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  {expired && (
                    <div className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-md">
                      <Info className="h-4 w-4 mr-1.5" />
                      <span className="text-xs font-bold">Expired</span>
                    </div>
                  )}
                </div>
                <button className="w-full flex justify-center items-center py-2 bg-gray-50 text-black text-sm font-medium rounded-md border border-gray-200 hover:bg-gray-100">
                  <MessageSquareWarning className="h-4 w-4 mr-2" />
                  Report Issue
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
        userLicenses={mockUserLicenses}
      />
    </div>
  );
}

