"use client";

import { useState } from "react";
import RoundOneMatches from "@/components/ui/dashboard/matches/RoundOne";
import RoundTwoBracket from "@/components/ui/dashboard/matches/RoundTwo";
import { mapMatches } from "@/utils/mapMatches";
import { rawMatches as rawRound2Matches } from "@/constants/MatchesData";

export default function TournamentPage() {
  // Round 1 matches (cards)
  const [round1Matches, setRound1Matches] = useState([
    { id: 1, teamA: { id: "t1", name: "Team Alpha" }, teamB: { id: "t2", name: "Team Beta" }, scoreA: 2, scoreB: 1 },
    { id: 2, teamA: { id: "t3", name: "Team Gamma" }, teamB: { id: "t4", name: "Team Delta" }, scoreA: 0, scoreB: 0 },
    // add more matches here
  ]);

  
  // Round 2 matches (single-elimination)
  const round2Matches = mapMatches(rawRound2Matches);

  // Round 1 update handler
  const handleRound1Update = (id, data) => {
    console.log("Round 1 Update:", id, data);
    setRound1Matches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );
    // optionally call backend API here
  };

  return (
    <div className="p-4 space-y-12">
      {/* ROUND 1 */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Round 1 Matches</h2>
        <RoundOneMatches matches={round1Matches} onUpdate={handleRound1Update} />
      </section>

      {/* ROUND 2 */}
      <section className="pb-5">
        <h2 className="text-2xl font-bold text-white mb-4">Round 2 Bracket</h2>
        <RoundTwoBracket matches={round2Matches} />
      </section>
    </div>
  );
}
