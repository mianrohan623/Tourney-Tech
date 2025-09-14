"use client";

import {
  SingleEliminationBracket,
  SVGViewer,
  Match,
  createTheme,
} from "@g-loot/react-tournament-brackets";
import { useEffect, useState } from "react";
import EditMatchModal from "./EditMatchesModel";

/**
 * RoundTwoBracket Component
 * @param {Array} matches - Matches data mapped for SingleEliminationBracket
 * @param {Array} teams - List of all teams for modal dropdown
 * @param {Function} onUpdate - Callback when match is updated
 */
export default function RoundTwoBracket({ matches, teams = [], onUpdate }) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [theme, setTheme] = useState(createTheme({}));
  const [editingMatch, setEditingMatch] = useState(null);

  // Helper to get CSS variable or fallback
  const getCSSVar = (name, fallback) => {
    if (typeof window === "undefined") return fallback;
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim() || fallback
    );
  };

  // Update dimensions & theme dynamically
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 100,
      });

      setTheme(
        createTheme({
          textColor: {
            main: getCSSVar("--foreground", "#ededed"),
            highlighted: "#ffffff",
            dark: "#cccccc",
          },
          matchBackground: {
            wonColor: getCSSVar("--card-background", "#101828"),
            lostColor: getCSSVar("--secondary-color", "#1f2937"),
          },
          score: {
            background: {
              wonColor: getCSSVar("--accent-color", "#FBBF24"),
              lostColor: "rgba(251, 191, 36, 0.1)",
            },
            text: {
              highlightedWonColor: getCSSVar("--foreground", "#ffffff"),
              highlightedLostColor: "#999999",
            },
          },
          border: {
            color: getCSSVar("--border-color", "#364153"),
            highlightedColor: getCSSVar("--accent-color", "#FBBF24"),
          },
          roundHeader: {
            backgroundColor: getCSSVar("--accent-color", "#FBBF24"),
            fontColor: getCSSVar("--background", "#030712"),
          },
          connectorColor: getCSSVar("--border-color", "#364153"),
          connectorColorHighlight: getCSSVar("--accent-color", "#FBBF24"),
          svgBackground: getCSSVar("--background", "#030712"),
        })
      );
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleSave = (id, data) => {
    if (onUpdate) onUpdate(id, data);
    setEditingMatch(null);
  };

  return (
    <div className="overflow-auto scrollbar-x">
      <SingleEliminationBracket
        matches={matches}
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
