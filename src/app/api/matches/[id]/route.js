import { Match } from "@/models/Match";
import { BracketGroup } from "@/models/BracketGroup";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { parseForm } from "@/utils/server/parseForm";

export const PATCH = asyncHandler(async (req, context) => {
  const matchId = context.params.id;
  const { fields } = await parseForm(req);
  const { teamAScore, teamBScore } = fields;

  const match = await Match.findById(matchId).populate("teamA teamB tournament game");
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

  // ✅ Stage progression
  let nextStage = null;
  if (match.stage === "group") nextStage = "qualifier";
  else if (match.stage === "qualifier") nextStage = "semi_final";
  else if (match.stage === "semi_final") nextStage = "final";
  else if (match.stage === "final") {
    match.status = "completed"; // Tournament ends
  }

  await match.save();

  // ✅ Agar final ke ilawa koi aur stage hai → create next stage match
  if (nextStage) {
    const nextMatch = await Match.create({
      tournament: match.tournament._id,
      game: match.game._id,
      teamA: match.winner, // winner goes ahead
      stage: nextStage,
      status: "pending",
    });

    // ✅ Bracket update
    await BracketGroup.create({
      tournament: match.tournament._id,
      game: match.game._id,
      name: `${nextStage}-${match._id}`, // e.g. "semi_final-123"
      order: 1, // yahan aapko dynamically set karna hoga
      bracketSide: "winner",
    });
  }

  return Response.json(
    new ApiResponse(200, match, `Match updated: ${match.teamA.name} vs ${match.teamB.name}`)
  );
});
