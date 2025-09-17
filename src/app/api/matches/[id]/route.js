import { Match } from "@/models/Match";
import { BracketGroup } from "@/models/BracketGroup";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { parseForm } from "@/utils/server/parseForm";
import "@/models/Tournament";
import "@/models/Game";
import "@/models/Team";

export const PATCH = asyncHandler(async (req, context) => {
  const matchId = context.params.id;
  const { fields } = await parseForm(req);
  const { teamAScore, teamBScore } = fields;

  const match = await Match.findById(matchId).populate("teamA teamB tournament game");
  if (!match) throw new ApiResponse(404, null, "Match not found");

  match.teamAScore = teamAScore;
  match.teamBScore = teamBScore;
  match.completedAt = new Date();

  if (teamAScore > teamBScore) {
    match.winner = match.teamA._id;
    match.loser = match.teamB._id;
  } else if (teamBScore > teamAScore) {
    match.winner = match.teamB._id;
    match.loser = match.teamA._id;
  } else {
    throw new ApiResponse(400, null, "Draw not supported in knockout format");
  }

  let nextStage = null;
  if (match.stage === "group") nextStage = "qualifier";
  else if (match.stage === "qualifier") nextStage = "semi_final";
  else if (match.stage === "semi_final") nextStage = "final";
  else if (match.stage === "final") {
    match.status = "completed"; 
  }

  await match.save();

  if (nextStage) {
    await Match.create({
      tournament: match.tournament._id,
      game: match.game._id,
      teamA: match.winner, 
      stage: nextStage,
      status: "pending",
    });

    await BracketGroup.create({
      tournament: match.tournament._id,
      game: match.game._id,
      name: `${nextStage}-${match._id}`, 
      order: 1,
      bracketSide: "winner",
    });
  }

  return Response.json(
    new ApiResponse(200, match, `Match updated: ${match.teamA.name} vs ${match.teamB.name}`)
  );
});
