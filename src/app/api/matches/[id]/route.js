import { Match } from "@/models/Match";
import { BracketGroup } from "@/models/BracketGroup";
import { Team } from "@/models/Team";
import { Tournament } from "@/models/Tournament";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { parseForm } from "@/utils/server/parseForm";
import "@/models/Game";

function getStageName(round, totalRounds) {
  if (round < totalRounds - 2) return "group";
  if (round === totalRounds - 2) return "qualifier";
  if (round === totalRounds - 1) return "semi_final";
  if (round === totalRounds) return "final";
  return "group";
}

export const PATCH = asyncHandler(async (req, context) => {
  const matchId = context.params.id;
  const { fields } = await parseForm(req);
  const { teamAScore, teamBScore } = fields;

  const match = await Match.findById(matchId).populate(
    "teamA teamB tournament game"
  );
  if (!match) throw new ApiResponse(404, null, "Match not found");

  // ✅ Score update
  match.teamAScore = teamAScore;
  match.teamBScore = teamBScore;
  match.completedAt = new Date();

  // ✅ Winner / Loser decide
  if (teamAScore > teamBScore) {
    match.winner = match.teamA._id;
    match.loser = match.teamB._id;
  } else if (teamBScore > teamAScore) {
    match.winner = match.teamB._id;
    match.loser = match.teamA._id;
  } else {
    throw new ApiResponse(400, null, "Draw not supported in knockout format");
  }

  // ✅ Mark match as completed
  match.status = "completed";
  await match.save();

  // ✅ Check if current round is complete
  const sameRoundMatches = await Match.find({
    tournament: match.tournament._id,
    game: match.game._id,
    round: match.round,
  });

  const allCompleted = sameRoundMatches.every((m) => m.status === "completed");

  if (allCompleted) {
    // ✅ Winners of this round
    const winners = sameRoundMatches.map((m) => m.winner);

    // ✅ Tournament info
    const totalTeams = await Team.countDocuments({
      tournament: match.tournament._id,
      game: match.game._id,
    });
    const totalRounds = Math.ceil(Math.log2(totalTeams));

    const nextRound = match.round + 1;
    if (nextRound <= totalRounds) {
      const nextStage = getStageName(nextRound, totalRounds);

      // ✅ Winners ko shuffle karke next round ke matches bana do
      for (let i = 0; i < winners.length; i += 2) {
        const teamA = winners[i];
        const teamB = winners[i + 1];

        if (!teamB) continue; // odd team skip

        await Match.create({
          tournament: match.tournament._id,
          game: match.game._id,
          round: nextRound,
          stage: nextStage,
          status: "pending",
          teamA,
          teamB,
        });
      }
    }
  }

  return Response.json(
    new ApiResponse(
      200,
      match,
      `Match updated: ${match.teamA.name} vs ${match.teamB.name}`
    )
  );
});
