// ManageUsers.jsx
"use client";

import { useState } from "react";
import UserTable from "@/components/ui/admin/UserTable";
import CreateUserForm from "@/components/ui/admin/User/CreateUserForm";

export default function ManageUsers() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Called after create or edit to close form
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Users</h1>
        <button
          onClick={() => {
            setEditingUser(null); // Reset edit user
            setShowForm((prev) => !prev);
          }}
          className="px-4 py-2 rounded-lg font-semibold 
          bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] 
          text-white transition-all duration-200"
        >
          {showForm ? "Close Form" : "Create User"}
        </button>
      </div>

      {/* Form for Create or Edit */}
      {showForm && (
        <div className="mb-8">
          <CreateUserForm
            user={editingUser} // null for create, user object for edit
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      {/* User Table */}
      <UserTable
        onEditUser={(user) => {
          setEditingUser(user);
          setShowForm(true);
        }}
      />
    </div>
  );
}
