import { Search, Upload, Bell } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 h-[112px] flex-shrink-0">
        <div className="flex justify-between items-center h-full px-6">
            {/* Left side: Title and Subtitle */}
            <div>
                <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-xs text-gray-700">Overview of your software licenses and usage</p>
            </div>

            {/* Right side: Action Buttons and User Info */}
            <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-base text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 border border-gray-300">
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                </button>
                 <button className="flex items-center space-x-2 text-base text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 border border-gray-300">
                    <Upload className="w-5 h-5" />
                    <span>Export</span>
                </button>
                <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-base font-semibold hover:bg-indigo-700 transition-colors">
                    + Add License
                </button>
                
                {/* Separator */}
                <div className="w-px h-6 bg-gray-200"></div>

                <div className="flex items-center space-x-3">
                    <button className="relative p-3 rounded-full hover:bg-gray-100">
                        <Bell className="w-6 h-6 text-gray-700" />
                        {/* Notification dot */}
                        <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-yellow-400"></span>
                    </button>
                    {/* User Avatar */}
                    <div className="w-9 h-9 bg-gray-300 rounded-full cursor-pointer">
                        {/* You can place an <img /> tag here */}
                    </div>
                </div>
            </div>
        </div>
    </header>
  );
}

