"use client";

import { useState } from "react";

import DashboardNavbar from "@/components/ui/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/ui/dashboard/DashboardSidebar";

import AdminGuard from "@/components/gard/admin/AdminGard";


import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  BadgePlus,
  Gamepad2,
} from "lucide-react";

// Change this to adminNavItems if needed
const adminNavItems = [
  { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
  { href: "/dashboard", label: "Switch To User", icon: LayoutDashboard },
  { href: "/admin/users", label: "Manage Users", icon: Users },
  { href: "/admin/add-games", label: "Add Game", icon: Gamepad2 },
  {
    href: "/admin/create-tournament",
    label: "Create Tournament",
    icon: BadgePlus,
  },
  {
    label: "Settings",
    icon: Settings,
    children: [{ href: "/admin/settings/profile", label: "Profile Settings" }],
  },
  { href: "/logout", label: "Logout", icon: LogOut },
];

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          navItems={adminNavItems} // Pass this dynamically
        />

        {/* Content */}
        <div className="flex flex-col flex-1 w-0">
          <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6 bg-background text-foreground scrollbar">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
