"use client";

import {
  SingleEliminationBracket,
  SVGViewer,
  Match,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import { useEffect, useState } from "react";
import EditMatchModal from "./EditMatchesModel";

export default function RoundTwoBracket({ matches = [], teams = [], onUpdate }) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [theme, setTheme] = useState(createTheme({}));
  const [editingMatch, setEditingMatch] = useState(null);
  const [mappedMatches, setMappedMatches] = useState([]);

  // 🔹 Safe formatter for API matches
  const formatMatches = (rawMatches) => {
    return rawMatches.map((m) => {
      const winnerId =
        typeof m.winner === "object" ? m.winner?._id : m.winner || null;

      return {
        id: m._id,
        name: m.stage || `Round ${m.round}`,
        nextMatchId: null,
        tournamentRoundText: `Round ${m.round}`,
        startTime: m.createdAt,
        state: m.status === "completed" ? "DONE" : "PENDING",
        participants: [
          {
            id: m.teamA?._id || "TBD",
            name: m.teamA?.name || "TBD",
            isWinner: winnerId === m.teamA?._id,
            resultText: "",
            score: m.teamAScore ?? 0,
          },
          {
            id: m.teamB?._id || "TBD",
            name: m.teamB?.name || "TBD",
            isWinner: winnerId === m.teamB?._id,
            resultText: "",
            score: m.teamBScore ?? 0,
          },
        ],
      };
    });
  };

  // 🔹 Update dimensions & theme dynamically
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 100,
      });

      setTheme(
        createTheme({
          textColor: { main: "#ededed", highlighted: "#ffffff", dark: "#cccccc" },
          matchBackground: { wonColor: "#101828", lostColor: "#1f2937" },
          score: {
            background: {
              wonColor: "#FBBF24",
              lostColor: "rgba(251, 191, 36, 0.1)",
            },
            text: {
              highlightedWonColor: "#ffffff",
              highlightedLostColor: "#999999",
            },
          },
          border: { color: "#364153", highlightedColor: "#FBBF24" },
          roundHeader: { backgroundColor: "#FBBF24", fontColor: "#030712" },
          connectorColor: "#364153",
          connectorColorHighlight: "#FBBF24",
          svgBackground: "#030712",
        })
      );
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // 🔹 Map matches when API data changes
  useEffect(() => {
    if (matches?.length) {
      setMappedMatches(formatMatches(matches));
    } else {
      setMappedMatches([]);
    }
  }, [matches]);

  const handleSave = (id, data) => {
    if (onUpdate) onUpdate(id, data);
    setEditingMatch(null);
  };

  return (
    <div className="overflow-auto scrollbar-x">
      {mappedMatches.length > 0 ? (
        <SingleEliminationBracket
          matches={mappedMatches}
          matchComponent={(props) => (
            <div onClick={() => setEditingMatch(props.match)}>
              <Match {...props} />
            </div>
          )}
          theme={theme}
          svgWrapper={({ children, ...props }) => (
            <SVGViewer
              background={theme.svgBackground}
              SVGBackground={theme.svgBackground}
              width={dimensions.width}
              height={dimensions.height}
              {...props}
            >
              {children}
            </SVGViewer>
          )}
        />
      ) : (
        <p className="text-center text-gray-400 p-6">No matches available</p>
      )}

      {/* Shared Modal for Editing */}
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
