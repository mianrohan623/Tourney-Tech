"use client";

import {
  SingleEliminationBracket,
  SVGViewer,
  Match,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import { useEffect, useState, useRef } from "react";
import EditMatchModal from "./EditMatchesModel";
import api from "@/utils/axios";

export default function RoundTwoBracket({ matches = [], teams = [], onEdit }) {
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

  // 🔹 Format matches for bracket
  const formatMatches = (rawMatches) => {
    return rawMatches.map((m) => {
      const winnerId = typeof m.winner === "object" ? m.winner?._id : m.winner || null;
      const roundText =
        m.stage === "semi_final" ? "Semi Final" :
        m.stage === "final" ? "Final" :
        m.stage === "qualifier" ? "Qualifier" :
        `Round ${m.round}`;

      return {
        id: m._id,
        name: roundText,
        nextMatchId: m.nextMatchId || null,
        tournamentRoundText: roundText,
        startTime: m.createdAt,
        state: m.status === "completed" ? "DONE" : "PENDING",
        participants: [
          {
            id: m.teamA?._id || `TBD-${m._id}-A`,
            name: `${m.teamA?.serialNo || ""} ${m.teamA?.name || "TBD"}`,
            isWinner: winnerId === m.teamA?._id,
            resultText:
              m.status === "completed"
                ? `${m.teamAScore ?? 0} ${winnerId === m.teamA?._id ? "Win" : "Lose"}`
                : `${m.teamAScore ?? 0}`,
          },
          {
            id: m.teamB?._id || `TBD-${m._id}-B`,
            name: `${m.teamB?.serialNo || ""} ${m.teamB?.name || "TBD"}`,
            isWinner: winnerId === m.teamB?._id,
            resultText:
              m.status === "completed"
                ? `${m.teamBScore ?? 0} ${winnerId === m.teamB?._id ? "Win" : "Lose"}`
                : `${m.teamBScore ?? 0}`,
          },
        ],
      };
    });
  };

  // 🔹 Generate full bracket with placeholders for future rounds
  const generateFullBracket = (matches) => {
    if (!matches.length) return [];

    // Group matches by round
    const rounds = {};
    matches.forEach((m) => {
      if (!rounds[m.round]) rounds[m.round] = [];
      rounds[m.round].push(m);
    });

    const allMatches = [...matches];

    // Generate placeholders for next rounds
    let currentRound = Math.max(...matches.map((m) => m.round));
    while (rounds[currentRound].length > 1) {
      const nextRound = currentRound + 1;
      const nextRoundMatches = [];

      for (let i = 0; i < Math.ceil(rounds[currentRound].length / 2); i++) {
        nextRoundMatches.push({
          _id: `placeholder-${nextRound}-${i}`,
          round: nextRound,
          stage:
            rounds[currentRound][0].stage === "qualifier"
              ? "semi_final"
              : rounds[currentRound][0].stage === "semi_final"
              ? "final"
              : "final",
          teamA: { _id: null, name: "TBD" },
          teamB: { _id: null, name: "TBD" },
          status: "pending",
          teamAScore: 0,
          teamBScore: 0,
          nextMatchId: null,
        });

        // Link previous matches to next match
        const matchA = rounds[currentRound][i * 2];
        const matchB = rounds[currentRound][i * 2 + 1];
        if (matchA) matchA.nextMatchId = nextRoundMatches[i]._id;
        if (matchB) matchB.nextMatchId = nextRoundMatches[i]._id;
      }

      rounds[nextRound] = nextRoundMatches;
      allMatches.push(...nextRoundMatches);
      currentRound = nextRound;
    }

    return allMatches;
  };

  // 🔹 Update dimensions & theme
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: window.innerHeight - 150,
        });
      }

      setTheme(
        createTheme({
          textColor: { main: "#ededed", highlighted: "#ffffff", dark: "#cccccc" },
          matchBackground: { wonColor: "#101828", lostColor: "#1f2937" },
          score: {
            background: { wonColor: "#FBBF24", lostColor: "rgba(251, 191, 36, 0.1)" },
            text: { highlightedWonColor: "#ffffff", highlightedLostColor: "#999999" },
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

  // 🔹 Map matches with placeholders
  useEffect(() => {
    if (matches.length) {
      const fullBracket = generateFullBracket(matches);
      setMappedMatches(formatMatches(fullBracket));
    } else {
      setMappedMatches([]);
    }
  }, [matches]);

  // 🔹 Handle match save and update next match participants
  const handleSave = (id, data) => {
    if (onEdit) onEdit(id, data);

    setMappedMatches((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          // Update current match
          const updatedMatch = {
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
          };

          // Update next match participant if nextMatchId exists
          if (m.nextMatchId && data.winner) {
            const nextMatch = prev.find((nm) => nm.id === m.nextMatchId);
            if (nextMatch) {
              const nextParticipantIndex = nextMatch.participants[0].id.startsWith("TBD")
                ? 0
                : 1;
              nextMatch.participants[nextParticipantIndex] = {
                id: data.winner,
                name: data.winnerName || "Winner",
                isWinner: false,
                resultText: "",
              };
            }
          }

          return updatedMatch;
        }
        return m;
      })
    );

    setEditingMatch(null);
  };

  return (
    <div ref={containerRef} className="w-full overflow-auto scrollbar-x">
      {mappedMatches.length > 0 ? (
        <SingleEliminationBracket
          matches={mappedMatches}
          matchComponent={(props) => {
            const originalMatch = mappedMatches.find((m) => m.id === props.match.id);

            if (!originalMatch) {
              return (
                <div className="cursor-not-allowed opacity-70">
                  <Match {...props} />
                </div>
              );
            }

            const userId = currentUser?._id;
            const isAdmin = currentUser?.role === "admin";

            const isUserInTeam =
              originalMatch.participants.some((p) => p.id === userId);

            let canEdit = false;
            if (originalMatch.state === "DONE") canEdit = isAdmin;
            else canEdit = isAdmin || isUserInTeam;

            return (
              <div
                onClick={() => canEdit && setEditingMatch(originalMatch)}
                className={canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-70"}
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
