"use client";

import {
  SingleEliminationBracket,
  SVGViewer,
  Match,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import { useEffect, useState, useRef } from "react";
import EditMatchModal from "./EditMatchesModel";
import api from "@/utils/axios"; // ✅ your axios instance

export default function RoundTwoBracket({ matches = [], teams = [], onUpdate }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [theme, setTheme] = useState(createTheme({}));
  const [editingMatch, setEditingMatch] = useState(null);
  const [mappedMatches, setMappedMatches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Fetch logged in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/api/me");
        setCurrentUser(data?.data?.user || null);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Safe formatter for API matches
  const formatMatches = (rawMatches) => {
    const matchIdMap = {};

    rawMatches.forEach((m) => {
      const winnerId =
        typeof m.winner === "object" ? m.winner?._id : m.winner || null;

      matchIdMap[m._id] = {
        id: m._id,
        name: m.stage || `Round ${m.round}`,
        nextMatchId: null,
        tournamentRoundText: `Round ${m.round}`,
        startTime: m.createdAt,
        state: m.status === "completed" ? "DONE" : "PENDING",
        participants: [
          {
            id: m.teamA?._id || `TBD-${m._id}-A`,
            name: `${m.teamA?.serialNo || ""} ${m.teamA?.name || "No Team"}`,
            isWinner: winnerId === m.teamA?._id,
            resultText:
              m.status === "completed"
                ? `${m.teamAScore ?? 0} ${
                    winnerId === m.teamA?._id ? "Win" : "Lose"
                  }`
                : `${m.teamAScore ?? 0}`,
          },
          {
            id: m.teamB?._id || `TBD-${m._id}-B`,
            name: `${m.teamB?.serialNo || ""} ${m.teamB?.name || "No Team"}`,
            isWinner: winnerId === m.teamB?._id,
            resultText:
              m.status === "completed"
                ? `${m.teamBScore ?? 0} ${
                    winnerId === m.teamB?._id ? "Win" : "Lose"
                  }`
                : `${m.teamBScore ?? 0}`,
          },
        ],
      };
    });

    return Object.values(matchIdMap);
  };

  // 🔹 Update dimensions & theme dynamically
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: window.innerHeight - 150, // leave space for navbar etc.
        });
      }

      setTheme(
        createTheme({
          textColor: {
            main: "#ededed",
            highlighted: "#ffffff",
            dark: "#cccccc",
          },
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
  if (onUpdate) onUpdate(id, data); // still notify parent

  // ✅ Update local state immediately so UI refreshes
  setMappedMatches((prev) =>
    prev.map((m) =>
      m.id === id
        ? {
            ...m,
            participants: [
              {
                ...m.participants[0],
                resultText: data.teamAScore,
                isWinner: data.winner === m.participants[0].id,
              },
              {
                ...m.participants[1],
                resultText: data.teamBScore,
                isWinner: data.winner === m.participants[1].id,
              },
            ],
            state: data.winner ? "DONE" : "PENDING",
          }
        : m
    )
  );

  setEditingMatch(null);
};


  return (
    <div ref={containerRef} className="w-full overflow-auto scrollbar-x">
      {mappedMatches.length > 0 ? (
        <SingleEliminationBracket
          matches={mappedMatches}
          matchComponent={(props) => {
            const originalMatch = matches.find((m) => m._id === props.match.id);

            if (!originalMatch || originalMatch._id?.startsWith("placeholder-")) {
              return (
                <div className="cursor-not-allowed opacity-70">
                  <Match {...props} />
                </div>
              );
            }

            const userId = currentUser?._id;
            const isAdmin = currentUser?.role === "admin";

            const isUserInTeam =
              originalMatch.teamA?.members?.some((m) =>
                typeof m === "string" ? m === userId : m._id === userId
              ) ||
              originalMatch.teamB?.members?.some((m) =>
                typeof m === "string" ? m === userId : m._id === userId
              );

            // ✅ Permission rules
            let canEdit = false;
            if (originalMatch.winner) {
              // Match completed → only admin can edit
              canEdit = isAdmin;
            } else {
              // Pending → admin or players can edit
              canEdit = isAdmin || isUserInTeam;
            }

            return (
              <div
                onClick={() => canEdit && setEditingMatch(originalMatch)}
                className={
                  canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                }
              >
                <Match {...props} />
              </div>
            );
          }}
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
