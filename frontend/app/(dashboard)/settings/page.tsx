'use client';

import { useState } from 'react';
import { RefreshCw, Save, User, Bell, Shield, CreditCard } from 'lucide-react';

// --- HELPER COMPONENTS (Defined at the top for clarity) ---

// A reusable component for each settings section card.
const SettingsCard = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center mb-4">
      <Icon className="h-5 w-5 text-gray-500 mr-3" />
      <h3 className="font-bold text-lg text-gray-800">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// A reusable component for a single setting item within a card.
const SettingItem = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
  <div className="flex justify-between items-center border-t border-gray-100 py-4 first:border-t-0 first:pt-0 last:pb-0">
    <div>
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div>{children}</div>
  </div>
);

// The interactive toggle switch component.
const ToggleSwitch = ({ initialChecked }: { initialChecked: boolean }) => {
    const [isChecked, setIsChecked] = useState(initialChecked);
    return (
        <button
            onClick={() => setIsChecked(!isChecked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isChecked ? 'bg-blue-600' : 'bg-gray-200'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isChecked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
};

// --- MAIN PAGE COMPONENT (The Default Export) ---

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 text-gray-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h2>
          <p className="text-gray-500">Manage your account and application preferences</p>
        </div>
        <div className="flex items-center space-x-2">
            <button className="flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Default
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
            </button>
        </div>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Account Settings Card */}
        <SettingsCard title="Account Settings" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" defaultValue="Acme Corporation" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                    <input type="email" defaultValue="admin@acme.com" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <select defaultValue="utc-5" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="utc-5">Eastern Time (UTC-5)</option>
                        <option value="utc-8">Pacific Time (UTC-8)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Default Currency</label>
                    <select defaultValue="usd" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="usd">USD ($)</option>
                        <option value="eur">EUR (€)</option>
                    </select>
                </div>
            </div>
        </SettingsCard>

        {/* Notifications Card */}
        <SettingsCard title="Notifications" icon={Bell}>
            <SettingItem label="License Expiration Alerts" description="Get notified when licenses are about to expire">
                <ToggleSwitch initialChecked={true} />
            </SettingItem>
            <SettingItem label="Usage Threshold Alerts" description="Alert when license usage exceeds 80%">
                <ToggleSwitch initialChecked={true} />
            </SettingItem>
            <SettingItem label="New User Notifications" description="Notify when new users join the platform">
                <ToggleSwitch initialChecked={false} />
            </SettingItem>
            <SettingItem label="Weekly Reports" description="Receive weekly usage and cost reports">
                <ToggleSwitch initialChecked={true} />
            </SettingItem>
        </SettingsCard>

        {/* Security & Privacy Card */}
        <SettingsCard title="Security & Privacy" icon={Shield}>
            <SettingItem label="Two-Factor Authentication" description="Add an extra layer of security to your account">
                <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">Enabled</span>
                    <button className="text-sm font-semibold text-blue-600 hover:underline">Configure</button>
                </div>
            </SettingItem>
            <SettingItem label="Session Timeout" description="Automatically log out after inactivity">
                <select defaultValue="30" className="w-32 px-3 py-2 border border-gray-300 rounded-md">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                </select>
            </SettingItem>
            <SettingItem label="Data Export" description="Download your account data">
                <button className="px-3 py-1.5 bg-white text-gray-700 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-50">Request Export</button>
            </SettingItem>
        </SettingsCard>

        {/* Billing & Subscription Card */}
        <SettingsCard title="Billing & Subscription" icon={CreditCard}>
             <SettingItem label="Current Plan" description="Enterprise - $299/month">
                <div className="flex items-center space-x-3">
                    <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Active</span>
                    <button className="text-sm font-semibold text-blue-600 hover:underline">Upgrade</button>
                </div>
            </SettingItem>
             <SettingItem label="Payment Method" description="Visa ending in 4242">
                <button className="text-sm font-semibold text-blue-600 hover:underline">Update</button>
            </SettingItem>
        </SettingsCard>
      </div>
    </div>
  );
}

