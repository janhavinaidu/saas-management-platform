'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users } from 'lucide-react';

// An array of navigation items with the corrected href for Dashboard.
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Users', href: '/users', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white text-gray-800 flex-shrink-0 border-r border-gray-200 flex flex-col">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">SaaS Manager</h2>
      </div>

      {/* Navigation Links */}
      <nav className="mt-4 flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            // Active if exact match for dashboard ('/dashboard') else startsWith for subpaths
            const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm' // Active link style
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' // Inactive link style
                    }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

