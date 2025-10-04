'use client';

// A mock data array for software applications. In a real application, this would come from an API.
const applications = [
  { name: 'Microsoft 365', users: 1250, cost: 12500 },
  { name: 'Slack Premium', users: 980, cost: 7840 },
  { name: 'Adobe Creative Cloud', users: 450, cost: 22500 },
  { name: 'Figma Professional', users: 320, cost: 4800 },
  { name: 'Zoom Pro', users: 1100, cost: 5500 },
  { name: 'Salesforce', users: 280, cost: 8400 },
  { name: 'Atlassian Suite', users: 650, cost: 9750 },
];

/**
 * A component that displays a table of the top software applications by usage or cost.
 * This version includes enhanced styling for a more professional and modern look.
 */
export default function TopAppsTable() {
  return (
    // Card container for a consistent look with the rest of the dashboard
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="font-semibold text-lg text-gray-900">Top Software Applications</h3>
      <p className="text-sm text-gray-500 mb-4">Overview of your most used software licenses</p>
      
      {/* Table container with overflow for responsiveness */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="p-3">Application Name</th>
              <th className="p-3 text-right">Active Users</th>
              <th className="p-3 text-right">Monthly Cost</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-200">
            {applications.map((app) => (
              <tr key={app.name} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="p-3 whitespace-nowrap">
                  <div className="font-medium text-gray-800">{app.name}</div>
                </td>
                <td className="p-3 whitespace-nowrap text-right text-gray-600">
                  {app.users.toLocaleString()}
                </td>
                <td className="p-3 whitespace-nowrap text-right text-gray-600 font-medium">
                  ${app.cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

