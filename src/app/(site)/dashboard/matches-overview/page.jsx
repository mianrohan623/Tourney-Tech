"use client"

import {
  SingleEliminationBracket,
  SVGViewer,
  Match,
  createTheme,
} from "@g-loot/react-tournament-brackets";

import { useEffect, useState } from "react";
import { matches as rawMatches } from "@/constants/matches/matchesData";
import { mapMatches } from "@/utils/mapMatches";

// Helper function to get CSS variable values from :root
const getCSSVar = (name, fallback) => {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

export default function MatchesOverview() {
  const matches = mapMatches(rawMatches);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [theme, setTheme] = useState(
    createTheme({
      textColor: {
        main: "#ededed",
        highlighted: "#ffffff",
        dark: "#cccccc",
      },
      matchBackground: {
        wonColor: "#101828",
        lostColor: "#1f2937",
      },
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
      border: {
        color: "#364153",
        highlightedColor: "#FBBF24",
      },
      roundHeader: {
        backgroundColor: "#FBBF24",
        fontColor: "#030712",
      },
      connectorColor: "#364153",
      connectorColorHighlight: "#FBBF24",
      svgBackground: "#030712",
    })
  );

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
              wonColor: "#FBBF24",
              lostColor: "rgba(251, 191, 36, 0.1)",
            },
            text: {
              highlightedWonColor: getCSSVar("#ffffff"),
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

  return (
    <div className="overflow-auto scrollbar-x">
      <SingleEliminationBracket
        matches={matches}
        matchComponent={Match}
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
    </div>
  );
}
