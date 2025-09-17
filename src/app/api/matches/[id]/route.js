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
  const { teamAScore, teamBScore, teamAtotalWon, teamBtotalWon } = fields;

  const match = await Match.findById(matchId).populate("teamA teamB tournament game");
  if (!match) throw new ApiResponse(404, null, "Match not found");

  // ✅ Score update
  match.teamAScore = teamAScore;
  match.teamBScore = teamBScore;
  match.teamAtotalWon = teamAtotalWon;
  match.teamBtotalWon = teamBtotalWon;
  match.completedAt = new Date();
  match.status = "completed";

  // ✅ Winner decide
  if (teamAScore > teamBScore) {
    match.winner = match.teamA._id;
    match.loser = match.teamB._id;
  } else if (teamBScore > teamAScore) {
    match.winner = match.teamB._id;
    match.loser = match.teamA._id;
  } else {
    throw new ApiResponse(400, null, "Draw not supported in knockout format");
  }

  await match.save();

  // ✅ Check if current round is complete
  const sameRoundMatches = await Match.find({
    tournament: match.tournament._id,
    game: match.game._id,
    round: match.round,
  });

  const allCompleted = sameRoundMatches.every((m) => m.status === "completed");

  if (allCompleted) {
    // ✅ Collect winners of this round
    let winners = sameRoundMatches.map((m) => m.winner);

    // ✅ Tournament info
    const totalTeams = await Team.countDocuments({
      tournament: match.tournament._id,
      game: match.game._id,
    });
    const totalRounds = Math.ceil(Math.log2(totalTeams));

    const nextRound = match.round + 1;

    if (nextRound <= totalRounds) {
      const nextStage = getStageName(nextRound, totalRounds);

      // ✅ Agar odd number of winners hain → ek ko auto bye
      if (winners.length % 2 !== 0) {
        const byeTeam = winners.pop(); // last wali team ko bye
        winners.unshift(byeTeam); // usko winners list ke start me daal do
      }

      // ✅ Winners ke pairs banake next round ke matches create karo
      for (let i = 0; i < winners.length; i += 2) {
        const teamA = winners[i];
        const teamB = winners[i + 1];

        if (!teamB) {
          // bye team ko direct next round winner bana do
          await Match.create({
            tournament: match.tournament._id,
            game: match.game._id,
            round: nextRound,
            stage: nextStage,
            status: "completed", // direct win
            teamA,
            winner: teamA,
          });
          continue;
        }

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
    } else {
      // ✅ Final winner decide → Tournament complete
      const lastWinner = winners[0];
      await Tournament.findByIdAndUpdate(match.tournament._id, {
        status: "completed",
        winner: lastWinner,
      });
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

