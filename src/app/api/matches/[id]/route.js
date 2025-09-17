import { Match } from "@/models/Match";
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

  const match = await Match.findById(matchId).populate(
    "teamA teamB tournament game"
  );
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
    // ✅ Agar current round = 2 hai → Top 50 logic lagana hai
    if (match.round === 2) {
      const allTeams = await Team.find({
        tournament: match.tournament._id,
        game: match.game._id,
      });

      // ✅ Har team ke jeete huye matches gin lo
      const teamScores = await Promise.all(
        allTeams.map(async (team) => {
          const wonMatches = await Match.countDocuments({
            tournament: match.tournament._id,
            game: match.game._id,
            winner: team._id,
          });
          return { teamId: team._id, score: wonMatches };
        })
      );

      // ✅ Sort descending
      teamScores.sort((a, b) => b.score - a.score);

      // ✅ Top 50 teams
      const topTeams = teamScores.slice(0, 50).map((t) => t.teamId);

      // ✅ Stage decide
      let nextStage = "qualifier";
      if (topTeams.length <= 4) nextStage = "semi_final";
      if (topTeams.length === 2) nextStage = "final";

      let nextRound = match.round + 1;

      // ✅ Matches create
      let matchNumber =
        (await Match.countDocuments({
          tournament: match.tournament._id,
          game: match.game._id,
        })) + 1;

      const shuffled = topTeams.sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i += 2) {
        const teamA = shuffled[i];
        const teamB = shuffled[i + 1];

        if (!teamB) {
          await Match.create({
            tournament: match.tournament._id,
            game: match.game._id,
            round: nextRound,
            stage: nextStage,
            status: "completed", // bye = direct win
            teamA,
            winner: teamA,
            matchNumber,
          });
        } else {
          await Match.create({
            tournament: match.tournament._id,
            game: match.game._id,
            round: nextRound,
            stage: nextStage,
            status: "pending",
            teamA,
            teamB,
            matchNumber,
          });
        }
        matchNumber++;
      }
    } else {
      // ✅ Normal knockout flow
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

        // ✅ odd winners → bye system
        if (winners.length % 2 !== 0) {
          const byeTeam = winners.pop();
          winners.unshift(byeTeam);
        }

        let matchNumber =
          (await Match.countDocuments({
            tournament: match.tournament._id,
            game: match.game._id,
          })) + 1;

        for (let i = 0; i < winners.length; i += 2) {
  const teamA = winners[i];
  const teamB = winners[i + 1];

  if (!teamB) {
    // ✅ check if bye match already exists
    const existing = await Match.findOne({
      tournament: match.tournament._id,
      game: match.game._id,
      round: nextRound,
      teamA,
    });

    if (!existing) {
      await Match.create({
        tournament: match.tournament._id,
        game: match.game._id,
        round: nextRound,
        stage: nextStage,
        status: "completed", // bye = direct win
        teamA,
        winner: teamA,
        matchNumber: matchNumber++,
      });
    }
    continue;
  }

  // ✅ check if match already exists (teamA vs teamB OR teamB vs teamA)
  const existing = await Match.findOne({
    tournament: match.tournament._id,
    game: match.game._id,
    round: nextRound,
    $or: [
      { teamA, teamB },
      { teamA: teamB, teamB: teamA },
    ],
  });

  if (!existing) {
    await Match.create({
      tournament: match.tournament._id,
      game: match.game._id,
      round: nextRound,
      stage: nextStage,
      status: "pending",
      teamA,
      teamB,
      matchNumber: matchNumber++,
    });
  }
}

      } else {
        // ✅ Tournament final complete
        const lastWinner = winners[0];
        await Tournament.findByIdAndUpdate(match.tournament._id, {
          status: "completed",
          winner: lastWinner,
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
