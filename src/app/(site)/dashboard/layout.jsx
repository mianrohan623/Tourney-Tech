"use client";

import { useState } from "react";

import DashboardNavbar from "@/components/ui/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/ui/dashboard/DashboardSidebar";

import { LayoutDashboard, Users, LogOut, BellDot } from "lucide-react";

import UserGuard from "@/components/gard/user/UserGard";

// Change this to adminNavItems if needed
const userNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: Users },
  { href: "/dashboard/matches-overview", label: "Matches", icon: Users },
  { href: "/dashboard/notifications", label: "Notifications", icon: BellDot },
  { href: "/dashboard/teamup", label: "Team Up", icon: Users },
  { href: "/logOut", label: "Logout", icon: LogOut },
];

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <UserGuard>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          navItems={userNavItems} // Pass this dynamically
        />

        {/* Content */}
        <div className="flex flex-col flex-1 w-0">
          <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6 bg-background text-foreground scrollbar">
            {children}
          </main>
        </div>
      </div>
    </UserGuard>
  );
}
