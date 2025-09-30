"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import api from "@/utils/axios";

export default function UserTable({ onEditUser }) {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/users");
      setData(res.data.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await api.delete(`/api/user/${id}`);
      toast.success(res.data.message || "User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    }
  };

  const columns = useMemo(
    () => [
      { header: "#", cell: ({ row }) => row.index + 1 },
      { header: "Full Name", accessorFn: (row) => `${row.firstname} ${row.lastname}` },
      { header: "Username", accessorKey: "username" },
      { header: "Email", accessorKey: "email" },
      { header: "Gender", accessorKey: "gender" },
      { header: "Phone", accessorKey: "phone" },
      { header: "City", accessorKey: "city" },
      { header: "State", accessorKey: "stateCode" },
      { header: "Role", accessorKey: "role" },
      {
        header: "DOB",
        accessorKey: "dob",
        cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleDateString() : "-"),
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ getValue }) => (getValue() ? new Date(getValue()).toLocaleDateString() : "-"),
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex gap-3">
              <button
                onClick={() => onEditUser(user)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(user._id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        },
      },
    ],
    [onEditUser]
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-4">
      {/* Global Search */}
      <input
        type="text"
        placeholder="Search users..."
        className="mb-4 p-2 bg-[var(--card-background)] rounded w-full"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
      />

      <div className="scrollbar-x overflow-x-auto">
        <table className="w-full rounded overflow-hidden">
          <thead className="bg-[var(--card-background)] text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="text-left p-3 cursor-pointer select-none"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <span className="ml-2">
                      {{
                        asc: "🔼",
                        desc: "🔽",
                      }[header.column.getIsSorted()] ?? ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="bg-[var(--card-background)]">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-[var(--card-hover)]">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 border-t border-[var(--background)]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-4 py-2 bg-[var(--card-hover)] rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-4 py-2 bg-[var(--card-background)] rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
