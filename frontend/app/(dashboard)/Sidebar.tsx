'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Users, Settings } from 'lucide-react';

// An array of navigation items to be mapped over, making it easy to add more links later.
const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    // The usePathname hook gets the current URL path to determine which link is active.
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white text-gray-800 flex-shrink-0 border-r border-gray-200 flex flex-col">
            {/* Sidebar Header */}
            <div className="h-[65px] flex items-center px-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-indigo-600">SaaS Manager</h2>
            </div>
            {/* Navigation Links */}
            <nav className="mt-4 flex-1 p-4">
                <ul>
                    {navItems.map((item) => {
                        // Check if the current path starts with the link's href to handle nested routes.
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <li key={item.name} className="mb-2">
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors
                                        ${isActive
                                            ? 'bg-indigo-600 text-white shadow-md' // Active link style
                                            : 'text-gray-600 hover:bg-indigo-50' // Inactive link style
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

