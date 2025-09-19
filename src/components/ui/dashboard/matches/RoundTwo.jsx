"use client";

import {
  SingleEliminationBracket,
  SVGViewer,
  Match,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import { useEffect, useState, useRef } from "react";
import EditMatchModal from "./EditMatchesModel";

export default function RoundTwoBracket({ matches = [], teams = [] }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [theme, setTheme] = useState(createTheme({}));
  const [editingMatch, setEditingMatch] = useState(null);
  const [mappedMatches, setMappedMatches] = useState([]);

  // Format match for bracket
  const formatMatch = (m) => {
    const winnerId =
      typeof m.winner === "object" ? m.winner?._id : m.winner || null;
    const roundText =
      m.stage === "semi_final"
        ? "Semi Final"
        : m.stage === "final"
          ? "Final"
          : m.stage === "qualifier"
            ? "Qualifier"
            : `Round ${m.round}`;

    return {
      id: m._id,
      name: roundText,
      nextMatchId: m.nextMatchId || null,
      tournamentRoundText: roundText,
      state: m.status === "completed" ? "DONE" : "PENDING",
      participants: [
        {
          id: m.teamA?._id || `TBD-${m._id}-A`,
          name: `${m.teamA?.serialNo ?? ""} ${m.teamA?.name ?? "TBD"}`.trim(),
          isWinner: winnerId === m.teamA?._id,
          resultText: `${m.teamAScore ?? 0}`,
        },
        {
          id: m.teamB?._id || `TBD-${m._id}-B`,
          name: `${m.teamB?.serialNo ?? ""} ${m.teamB?.name ?? "TBD"}`.trim(),
          isWinner: winnerId === m.teamB?._id,
          resultText: `${m.teamBScore ?? 0}`,
        },
      ],
      original: m,
    };
  };

  // Generate full bracket with dynamic propagation
  const generateBracket = (matches) => {
    if (!matches.length) return [];

    const allMatches = [...matches];
    const rounds = {};

    // group by round
    matches.forEach((m) => {
      if (!rounds[m.round]) rounds[m.round] = [];
      rounds[m.round].push(m);
    });

    let currentRound = Math.max(...matches.map((m) => m.round));

    // build next round dynamically
    while (rounds[currentRound] && rounds[currentRound].length > 1) {
      const nextRound = currentRound + 1;
      rounds[nextRound] = rounds[nextRound] || [];

      for (let i = 0; i < Math.ceil(rounds[currentRound].length / 2); i++) {
        const matchA = rounds[currentRound][i * 2];
        const matchB = rounds[currentRound][i * 2 + 1];

        const nextMatchId = `placeholder-${nextRound}-${i}`;
        let existing = allMatches.find(
          (m) => m._id === matchA?.nextMatchId || m._id === matchB?.nextMatchId
        );

        if (!existing) {
          existing = {
            _id: nextMatchId,
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
          };
          allMatches.push(existing);
          rounds[nextRound].push(existing);
        }

        if (matchA) matchA.nextMatchId = existing._id;
        if (matchB) matchB.nextMatchId = existing._id;

        // propagate winners
        if (matchA?.winner || matchB?.winner) {
          const winnerId = matchA?.winner || matchB?.winner;
          const winnerName = matchA?.winner
            ? matchA.teamA?.name || matchA.teamB?.name
            : matchB?.teamA?.name || matchB?.teamB?.name;

          if (!existing.teamA?._id || existing.teamA?.name === "TBD") {
            existing.teamA = { _id: winnerId, name: winnerName };
          } else if (!existing.teamB?._id || existing.teamB?.name === "TBD") {
            existing.teamB = { _id: winnerId, name: winnerName };
          }
        }
      }

      currentRound = nextRound;
    }

    return allMatches;
  };

  // theme
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

  useEffect(() => {
    const fullBracket = generateBracket(matches);
    setMappedMatches(fullBracket.map(formatMatch));
  }, [matches]);

  // Handle local match update
  const handleSave = (id, data) => {
    setMappedMatches((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = {
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
          // propagate to next match
          if (m.nextMatchId && data.winner) {
            const nextMatch = prev.find((nm) => nm.id === m.nextMatchId);
            if (nextMatch) {
              if (
                !nextMatch.participants[0]?.id ||
                nextMatch.participants[0].name === "TBD"
              ) {
                nextMatch.participants[0] = {
                  id: data.winner,
                  name: data.winnerName || "Winner",
                  isWinner: false,
                  resultText: "",
                };
              } else {
                nextMatch.participants[1] = {
                  id: data.winner,
                  name: data.winnerName || "Winner",
                  isWinner: false,
                  resultText: "",
                };
              }
            }
          }
          return updated;
        }
        return m;
      })
    );
    setEditingMatch(null);
  };

  return (
    <div ref={containerRef} className="w-full overflow-auto scrollbar-x">
      {mappedMatches.length ? (
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

      <EditMatchModal
        isOpen={!!editingMatch}
        match={editingMatch?.original || editingMatch} // ✅ pass original backend match
        teams={teams}
        onClose={() => setEditingMatch(null)}
        onSave={handleSave}
      />
    </div>
  );
}
