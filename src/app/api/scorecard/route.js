// GET /api/scoreboard
import { Match } from "@/models/Match";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import "@/models/Team"

export const GET = asyncHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");
  const gameId = searchParams.get("gameId");

  if (!tournamentId || !gameId) {
    throw new ApiResponse(400, null, "Tournament ID and Game ID required");
  }

  // ✅ Matches fetch
  const matches = await Match.find({ tournament: tournamentId, game: gameId })
    .populate("teamA teamB winner loser")
    .sort({ round: 1, matchNumber: 1 });

  if (!matches.length) {
    return Response.json(new ApiResponse(200, [], "No matches found"));
  }

  // ✅ Group by rounds
  const scoreboard = {};
  for (let match of matches) {
    if (!scoreboard[match.round]) {
      scoreboard[match.round] = {
        stage: match.stage,
        matches: [],
      };
    }

    scoreboard[match.round].matches.push({
      matchNumber: match.matchNumber,
      teamA: match.teamA?.name || "TBD",
      teamB: match.teamB?.name || "TBD",
      teamAScore: match.teamAScore ?? null,
      teamBScore: match.teamBScore ?? null,
      winner: match.winner ? match.winner.name : null,
      status: match.status,
    });
  }

  return Response.json(
    new ApiResponse(200, scoreboard, "Scoreboard fetched successfully")
  );
});
