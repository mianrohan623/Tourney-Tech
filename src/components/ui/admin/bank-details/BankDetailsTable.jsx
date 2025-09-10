"use client";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function BankDetailsTable() {
  const [accounts, setAccounts] = useState([
    { id: 1, bankName: "HBL", accountNumber: "123456789", accountHolder: "Admin One" },
    { id: 2, bankName: "UBL", accountNumber: "987654321", accountHolder: "Admin Two" },
    { id: 3, bankName: "Meezan Bank", accountNumber: "456123789", accountHolder: "Admin Three" },
    // Add more dummy rows for testing pagination
    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 4,
      bankName: `Bank ${i + 4}`,
      accountNumber: `${100000000 + i}`,
      accountHolder: `Admin ${i + 4}`,
    })),
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Pagination logic
  const totalPages = Math.ceil(accounts.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = accounts.slice(indexOfFirstRow, indexOfLastRow);

  const handleDelete = (id) => {
    setAccounts(accounts.filter((acc) => acc.id !== id));
  };

  const handleEdit = (id) => {
    alert(`Edit bank account with ID: ${id}`);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto scrollbar-x rounded-lg border border-[var(--border-color)]">
        <table className="min-w-full divide-y divide-[var(--border-color)]">
          <thead className="bg-[var(--secondary-color)]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground)]">Bank Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground)]">Account Number</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--foreground)]">Account Holder</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-[var(--foreground)]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] bg-[var(--card-background)]">
            {currentRows.map((account) => (
              <tr key={account.id} className="hover:bg-[var(--card-hover)]">
                <td className="px-4 py-3 text-sm">{account.bankName}</td>
                <td className="px-4 py-3 text-sm">{account.accountNumber}</td>
                <td className="px-4 py-3 text-sm">{account.accountHolder}</td>
                <td className="px-4 py-3 flex justify-center gap-3">
                  <button
                    onClick={() => handleEdit(account.id)}
                    className="p-2 rounded-lg bg-[var(--secondary-color)] hover:bg-[var(--secondary-hover)]"
                  >
                    <Pencil className="w-4 h-4 text-[var(--info-color)]" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 rounded-lg bg-[var(--secondary-color)] hover:bg-[var(--secondary-hover)]"
                  >
                    <Trash2 className="w-4 h-4 text-[var(--error-color)]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {accounts.length > rowsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg bg-[var(--secondary-color)] text-sm hover:bg-[var(--secondary-hover)] disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-[var(--secondary-color)] text-sm hover:bg-[var(--secondary-hover)] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
