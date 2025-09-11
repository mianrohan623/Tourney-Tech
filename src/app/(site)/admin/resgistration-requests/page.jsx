"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function AdminRegistrationsTable() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch registrations
  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const res = await api.get(`/api/tournamentRegister`);
        setRegistrations(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch registrations");
      } finally {
        setLoading(false);
      }
    }
    fetchRegistrations();
  }, []);

  // Approve/Reject handler
  const handleStatusUpdate = async (id, status) => {
    try {
      const formData = new FormData();
      formData.append("status", status);

      const res = await api.patch(`/api/tournamentRegister/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setRegistrations((prev) =>
        prev.map((r) =>
          r._id === id
            ? {
                ...r,
                gameRegistrationDetails: {
                  ...r.gameRegistrationDetails,
                  status: res.data.data.gameRegistrationDetails.status,
                  paid: res.data.data.gameRegistrationDetails.paid,
                },
              }
            : r
        )
      );

      toast.success(`Registration ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = registrations.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(registrations.length / rowsPerPage);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 max-w-full ">
      <div className="scrollbar-x overflow-x-auto">
        <table className="min-w-full border border-[var(--border-color)] rounded-lg overflow-hidden">
          <thead className="bg-[var(--secondary-color)] text-[var(--foreground)]">
            <tr>
              <th className="py-2 px-4 text-left">User</th>
              <th className="py-2 px-4 text-left">User Email</th>
              <th className="py-2 px-4 text-left">Tournament</th>
              <th className="py-2 px-4 text-left">Game</th>
              <th className="py-2 px-4 text-left">Entry Fee</th>
              <th className="py-2 px-4 text-left">Min Players</th>
              <th className="py-2 px-4 text-left">Max Players</th>
              <th className="py-2 px-4 text-left">Paid</th>
              <th className="py-2 px-4 text-left">Payment Method</th>
              <th className="py-2 px-4 text-left">Bank Name</th>
              <th className="py-2 px-4 text-left">Player Account Name</th>
              <th className="py-2 px-4 text-left">Player Transaction ID</th>
              <th className="py-2 px-4 text-left">Current Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--card-background)] text-[var(--foreground)]">
            {currentRows.map((r) => (
              <tr
                key={r._id}
                className="border-b border-[var(--border-color)] hover:bg-[var(--secondary-hover)]"
              >
                <td className="py-2 px-4">{r.user?.username}</td>
                <td className="py-2 px-4">{r.user?.email}</td>
                <td className="py-2 px-4">{r.tournament?.name || "-"}</td>
                <td className="py-2 px-4">
                  {r.gameRegistrationDetails?.games
                    ?.map((g) => g.name)
                    .join(", ")}
                </td>

                <td className="py-2 px-4">
                  {(r.gameRegistrationDetails?.games?.[0]?._id &&
                    r.tournament?.games?.find(
                      (g) =>
                        g._id === r.gameRegistrationDetails.games[0]._id ||
                        g.game === r.gameRegistrationDetails.games[0]._id
                    )?.entryFee) ||
                    0}{" "}
                </td>
                <td className="py-2 px-4">
                  {(r.gameRegistrationDetails?.games?.[0]?._id &&
                    r.tournament?.games?.find(
                      (g) =>
                        g._id === r.gameRegistrationDetails.games[0]._id ||
                        g.game === r.gameRegistrationDetails.games[0]._id
                    )?.minPlayers) ||
                    0}{" "}
                </td>
                <td className="py-2 px-4">
                  {(r.gameRegistrationDetails?.games?.[0]?._id &&
                    r.tournament?.games?.find(
                      (g) =>
                        g._id === r.gameRegistrationDetails.games[0]._id ||
                        g.game === r.gameRegistrationDetails.games[0]._id
                    )?.maxPlayers) ||
                    0}{" "}
                </td>
                <td className="py-2 px-4">
                  {r.gameRegistrationDetails?.paid ? (
                    <span className="text-[var(--success-color)]">Yes</span>
                  ) : (
                    <span className="text-[var(--error-color)]">No</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  {r.gameRegistrationDetails?.paymentMethod}
                </td>
                <td className="py-2 px-4">
                  {r.gameRegistrationDetails?.paymentDetails?.bankId
                    ?.bankName || "-"}
                </td>

                <td className="py-2 px-4">
                  {r.gameRegistrationDetails?.paymentDetails?.accountName ||
                    "-"}
                </td>
                <td className="py-2 px-4">
                  {r.gameRegistrationDetails?.paymentDetails?.transactionId ||
                    "-"}
                </td>

                <td
                  className={`text-center capitalize ${
                    r.gameRegistrationDetails?.status === "approved"
                      ? "text-[var(--success-color)]"
                      : r.gameRegistrationDetails?.status === "rejected"
                        ? "text-[var(--error-color)]"
                        : "text-white"
                  }`}
                >
                  {r.gameRegistrationDetails?.status}
                </td>

                <td className="py-2 px-4">
                  <select
                    value={r.gameRegistrationDetails?.status || "pending"}
                    onChange={(e) => handleStatusUpdate(r._id, e.target.value)}
                    className="px-2 py-1 rounded-lg border border-gray-300 bg-[var(--card-background)] text-[var(--foreground)]"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-[var(--foreground)]">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg bg-[var(--secondary-color)] hover:bg-[var(--secondary-hover)] disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-lg bg-[var(--secondary-color)] hover:bg-[var(--secondary-hover)] disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
