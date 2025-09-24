const applications = [
  { name: 'Microsoft 365', users: 1250, cost: 12500 },
  { name: 'Slack Premium', users: 980, cost: 7840 },
  { name: 'Adobe Creative Cloud', users: 450, cost: 22500 },
  { name: 'Figma Professional', users: 320, cost: 4800 },
  { name: 'Zoom Pro', users: 1100, cost: 5500 },
  { name: 'Salesforce', users: 280, cost: 8400 },
];

export default function TopAppsTable() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg text-gray-900">Top Software Applications</h3>
            <p className="text-sm text-gray-700 mb-4">Overview of your most used software licenses</p>
            <table className="w-full">
                <thead>
                    <tr className="text-left text-sm text-gray-700">
                        <th className="py-2 font-medium">Name</th>
                        <th className="py-2 font-medium">Users</th>
                        <th className="py-2 font-medium">Monthly Cost</th>
                    </tr>
                </thead>
                <tbody>
                    {applications.map((app) => (
                        <tr key={app.name} className="border-t">
                            <td className="py-4 font-semibold text-gray-900">{app.name}</td>
                            <td className="py-4 text-gray-600">{app.users.toLocaleString()}</td>
                            <td className="py-4 text-gray-600">${app.cost.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
