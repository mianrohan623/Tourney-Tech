"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/utils/axios";
import RoundOneMatches from "@/components/ui/dashboard/matches/RoundOne";
import RoundTwoBracket from "@/components/ui/dashboard/matches/RoundTwo";

export default function TournamentPage() {
  const { tournamentId, gameId } = useParams();

  const [round1Matches, setRound1Matches] = useState([]);
  const [round2Matches, setRound2Matches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isRefresh, setIsRefresh] = useState(false);

  // Fetch matches and create if none exist
  useEffect(() => {
    if (!tournamentId || !gameId) return;

    const fetchOrCreateMatches = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({ tournamentId, gameId });
        let res = await api.get(`/api/matches?${query.toString()}`);
        let allMatches = res.data?.data || [];

        // If no matches exist, create them
        if (allMatches.length === 0) {
          await api.post("/api/matches", { tournamentId, gameId });
          res = await api.get(`/api/matches?${query.toString()}`);
          allMatches = res.data?.data || [];
        }

        // Split matches by round
        const round1 = allMatches.filter((m) => m.round === 1);
        const round2Raw = allMatches.filter((m) => m.round === 2);

        setRound1Matches(round1);
        setRound2Matches(round2Raw); // ✅ send raw matches
      } catch (err) {
        console.error("Error fetching/creating matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateMatches();
  }, [tournamentId, gameId, isRefresh]);

  // Round 1 update handler (updates backend)
  const handleRound1Update = async (id, data) => {
    setRound1Matches((prev) =>
      prev.map((m) => (m._id === id ? { ...m, ...data } : m))
    );

    try {
      await api.patch(`/api/matches/${id}`, data);

      // Re-fetch matches so round 2 appears automatically
      const query = new URLSearchParams({ tournamentId, gameId });
      const res = await api.get(`/api/matches?${query.toString()}`);
      const allMatches = res.data?.data || [];
      const round2Raw = allMatches.filter((m) => m.round === 2);
      setRound2Matches(round2Raw); // ✅ send raw matches
    } catch (err) {
      console.error("Error updating match score:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-white">Loading matches...</p>
      </div>
    );
  }

  // Check if all round 1 matches are completed
  const isRound1Complete =
    round1Matches.length > 0 &&
    round1Matches.every((m) => m.status === "completed");

  return (
    <div className="p-4 space-y-12">
      {/* ROUND 1 */}
      {!isRound1Complete && round1Matches.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Round 1 Matches</h2>
          <RoundOneMatches
            matches={round1Matches}
            onUpdate={setIsRefresh}
            
          />
        </section>
      )}

      {/* ROUND 2 */}
      {isRound1Complete && round2Matches.length > 0 && (
        <section className="pb-5">
          <h2 className="text-2xl font-bold text-white mb-4">Round 2 Bracket</h2>
          <RoundTwoBracket matches={round2Matches} />
        </section>
      )}

      {/* No matches message */}
      {!round1Matches.length && !round2Matches.length && (
        <p className="text-center text-gray-400">
          No matches found for this tournament & game.
        </p>
      )}
    </div>
  );
}
