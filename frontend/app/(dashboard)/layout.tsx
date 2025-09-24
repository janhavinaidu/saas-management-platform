"use client";

import React, { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>

        {/* Footer */}
        <footer className="bg-gray-200 text-center p-4 text-sm text-gray-600">
          &copy; 2025 SaaS License Manager
        </footer>
      </div>
    </div>
  );
}
