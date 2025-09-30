"use client";

import { useState } from "react";
import UserTable from "@/components/ui/admin/UserTable";
import CreateUserForm from "@/components/ui/admin/User/CreateUserForm";

export default function ManageUsers() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Users</h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="px-4 py-2 rounded-lg font-semibold 
          bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] 
          text-white transition-all duration-200"
        >
          {showForm ? "Close Form" : "Create User"}
        </button>
      </div>

      {/* Conditionally render form */}
      {showForm && (
        <div className="mb-8">
          <CreateUserForm />
        </div>
      )}

      {/* User Table */}
      <UserTable />
    </div>
  );
}
