"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { getUser } from "@/lib/auth";
import jwtInterceptor from "@/utils/jwtInterceptor";

jwtInterceptor();

function isAdminUser(user) {
  return Boolean(user?.isAdmin);
}

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!isAdminUser(user)) {
      router.replace(user ? "/" : "/login/admin");
      return;
    }
    setIsAdmin(true);
  }, [router]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-lg font-bold text-black">Admin Panel</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-10 pt-10 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}
