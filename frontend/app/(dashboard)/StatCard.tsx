import React from 'react';

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  changeType: 'increase' | 'decrease';
};

export default function StatCard({ title, value, change, icon, changeType }: StatCardProps) {
  const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <div className="bg-gray-100 p-2 rounded-md">
          {icon}
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className={`text-sm ${changeColor}`}>{change}</p>
      </div>
    </div>
  );
}

