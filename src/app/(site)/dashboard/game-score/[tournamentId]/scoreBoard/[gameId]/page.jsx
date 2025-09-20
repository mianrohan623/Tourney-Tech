"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/utils/axios";
import { useParams } from "next/navigation";

export default function Scoreboard() {
  const { tournamentId, gameId } = useParams();
  const [scoreboard, setScoreboard] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Filters
  const [roundFilter, setRoundFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // matches per page

  useEffect(() => {
    if (!tournamentId || !gameId) return;

    const fetchScoreboard = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ tournamentId, gameId });
        const res = await api.get(`/api/scorecard?${query.toString()}`);
        setScoreboard(res.data?.data || {});
      } catch (err) {
        console.error("Error fetching scoreboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScoreboard();
  }, [tournamentId, gameId]);

  // ✅ Flatten matches for filtering & pagination
  const allMatches = useMemo(() => {
    return Object.entries(scoreboard).flatMap(([round, data]) =>
      data.matches.map((match) => ({
        ...match,
        round,
        stage: data.stage,
      }))
    );
  }, [scoreboard]);

  // ✅ Apply filters
  const filteredMatches = useMemo(() => {
    return allMatches.filter((match) => {
      const roundOk = roundFilter === "all" || match.round === roundFilter;
      const statusOk =
        statusFilter === "all" || match.status === statusFilter;
      return roundOk && statusOk;
    });
  }, [allMatches, roundFilter, statusFilter]);

  // ✅ Pagination
  const totalPages = Math.ceil(filteredMatches.length / pageSize);
  const paginatedMatches = filteredMatches.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-white">Loading scoreboard...</p>
      </div>
    );
  }

  if (!allMatches.length) {
    return (
      <p className="text-center text-gray-400">No matches available yet.</p>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          {/* Round Filter */}
          <select
            value={roundFilter}
            onChange={(e) => {
              setRoundFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-[var(--secondary-color)] text-white border border-[var(--border-color)]"
          >
            <option value="all">All Rounds</option>
            {Object.keys(scoreboard).map((round) => (
              <option key={round} value={round}>
                Round {round}
              </option>
            ))}
          </select>



          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-lg bg-[var(--secondary-color)] text-white border border-[var(--border-color)]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 rounded-lg bg-[var(--secondary-color)] text-white disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-gray-300 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 rounded-lg bg-[var(--secondary-color)] text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedMatches.map((match) => (
          <div
            key={`${match.round}-${match.matchNumber}`}
            className="p-4 rounded-2xl shadow-md border border-[var(--border-color)] bg-[var(--card-background)] hover:bg-[var(--card-hover)] transition duration-300"
          >
            <h3 className="text-sm text-gray-400 mb-3">
              Round {match.round} – Match #{match.matchNumber}
            </h3>

            {/* Team A */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{match.teamA}</span>
              <span
                className={`px-2 py-1 rounded-md text-sm ${
                  match.winner === match.teamA
                    ? "bg-[var(--success-color)] text-white"
                    : "bg-[var(--secondary-color)]"
                }`}
              >
                {match.teamAScore ?? "-"}
              </span>
            </div>

            {/* Team B */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{match.teamB}</span>
              <span
                className={`px-2 py-1 rounded-md text-sm ${
                  match.winner === match.teamB
                    ? "bg-[var(--success-color)] text-white"
                    : "bg-[var(--secondary-color)]"
                }`}
              >
                {match.teamBScore ?? "-"}
              </span>
            </div>

            {/* Status */}
            <div className="mt-3 text-xs text-gray-400">
              Status:{" "}
              <span
                className={`font-semibold ${
                  match.status === "completed"
                    ? "text-[var(--success-color)]"
                    : "text-[var(--info-color)]"
                }`}
              >
                {match.status}
              </span>
            </div>

          <div className="text-xs mt-2 ">
                <strong>Winner Team: </strong> 
                <span className="text-[var(--accent-color)]">{match.winner ?? "-"}</span> 
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
