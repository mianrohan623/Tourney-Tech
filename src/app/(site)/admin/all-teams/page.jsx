"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios"; // Axios instance
import { toast } from "react-hot-toast";

export default function AdminTeamsTable() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/team");
      setTeams(data.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  // Filtered teams based on search
  const filteredTeams = teams.filter((team) => {
    const term = searchTerm.toLowerCase();
    const teamName = team.name?.toLowerCase() || "";
    const tournamentName = team.tournament?.name?.toLowerCase() || "";
    const gamesNames = team.games?.map((g) => g.game?.name?.toLowerCase()).join(", ") || "";
    const memberNames = team.members?.map((m) => m.username.toLowerCase()).join(", ") || "";
    return (
      teamName.includes(term) ||
      tournamentName.includes(term) ||
      gamesNames.includes(term) ||
      memberNames.includes(term)
    );
  });

  // Pagination calculations
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredTeams.length / rowsPerPage);

  return (
    <div className="p-4 w-full">
      <h2 className="text-2xl font-bold mb-4">All Teams</h2>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by team, tournament, game, or member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-accent-color"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : (
        <div className="overflow-x-auto scrollbar rounded-lg border border-[var(--border-color)]">
          <table className="min-w-full border-collapse">
            <thead className="bg-[var(--secondary-color)] text-[var(--foreground)]">
              <tr>
                <th className="py-2 px-4 text-left font-semibold border-b border-[var(--border-color)]">Team Name</th>
                <th className="py-2 px-4 text-left font-semibold border-b border-[var(--border-color)]">Tournament</th>
                <th className="py-2 px-4 text-left font-semibold border-b border-[var(--border-color)]">Games</th>
                <th className="py-2 px-4 text-left font-semibold border-b border-[var(--border-color)]">Members</th>
                <th className="py-2 px-4 text-left font-semibold border-b border-[var(--border-color)]">Created By</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card-background)] text-[var(--foreground)]">
              {currentTeams.length === 0 ? (
                <tr className="hover:bg-[var(--secondary-hover)] transition-colors">
                  <td colSpan={5} className="text-center py-4 text-gray-400">No teams found</td>
                </tr>
              ) : (
                currentTeams.map((team) => (
                  <tr key={team._id} className="hover:bg-[var(--secondary-hover)] transition-colors">
                    <td className="py-2 px-4 border-b border-[var(--border-color)]">{team.name}</td>
                    <td className="py-2 px-4 border-b border-[var(--border-color)]">{team.tournament?.name || "N/A"}</td>
                    <td className="py-2 px-4 border-b border-[var(--border-color)]">
                      {team?.game?.name || "N/A"}
                    </td>
                    <td className="py-2 px-4 border-b border-[var(--border-color)]">
                      {team.members?.map((m) => m.username).join(", ")}
                    </td>
                    <td className="py-2 px-4 border-b border-[var(--border-color)]">
                      {team.createdBy ? `${team.createdBy.firstname} ${team.createdBy.lastname}` : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-2 text-foreground">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-secondary-color hover:bg-secondary-hover disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded ${
                    page === currentPage
                      ? "bg-primary-color text-foreground"
                      : "bg-secondary-color hover:bg-secondary-hover"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-secondary-color hover:bg-secondary-hover disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
