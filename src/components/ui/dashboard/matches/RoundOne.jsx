"use client";
import { useState, useMemo } from "react";
import EditMatchModal from "./EditMatchesModel";

export default function RoundOneMatches({ matches, teams, onUpdate, pageSize = 12 }) {
  const [editingMatch, setEditingMatch] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Filter matches based on search input
  const filteredMatches = useMemo(() => {
    if (!search) return matches;
    return matches.filter(
      (m) =>
        m.teamA.name.toLowerCase().includes(search.toLowerCase()) ||
        m.teamB.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, matches]);

  // Pagination
  const totalPages = Math.ceil(filteredMatches.length / pageSize);
  const currentMatches = filteredMatches.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSave = (id, data) => {
    if (onUpdate) onUpdate(id, data);
    setEditingMatch(null);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by team..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-xl"
          style={{
            background: "var(--card-background)",
            border: "1px solid var(--border-color)",
            color: "var(--foreground)",
          }}
        />
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentMatches.map((match) => (
          <div
            key={match.id}
            className="rounded-2xl p-4 shadow-md"
            style={{
              background: "var(--card-background)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Match #{match.id}</h3>
              <span className="text-sm text-gray-400">
                {match.roundName || "Round 1"}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="font-medium">{match.teamA.name}</span>
                <span className="font-mono">{match.scoreA ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{match.teamB.name}</span>
                <span className="font-mono">{match.scoreB ?? 0}</span>
              </div>
            </div>

            <button
              onClick={() => setEditingMatch(match)}
              className="w-full rounded-xl px-3 py-2 text-sm font-medium"
              style={{
                background: "var(--primary-color)",
                color: "var(--foreground)",
              }}
            >
              Add / Edit Score
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg"
            style={{
              background: "var(--secondary-color)",
              color: "var(--foreground)",
            }}
          >
            Prev
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg"
            style={{
              background: "var(--secondary-color)",
              color: "var(--foreground)",
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Shared Modal */}
      <EditMatchModal
        isOpen={!!editingMatch}
        match={editingMatch}
        teams={teams}
        onClose={() => setEditingMatch(null)}
        onSave={handleSave}
      />
    </div>
  );
}
