import { Match } from "@/models/Match";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
// import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";

export const PATCH = asyncHandler(async (req, context) => {
  // const user = await requireAuth(req);
  const matchId = context.params.id;

  const { fields } = await parseForm(req);
  const { teamAScore, teamBScore } = fields;

  const match = await Match.findById(matchId).populate("teamA teamB");
  if (!match) {
    throw new ApiResponse(404, null, "Match not found");
  }

  // 🔹 Score update
  match.teamAScore = teamAScore;
  match.teamBScore = teamBScore;
  match.status = "completed";
  match.completedAt = new Date();

  // 🔹 Winner decide
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

  return Response.json(
    new ApiResponse(
      200,
      match,
      `Match updated: ${match.teamA.name} vs ${match.teamB.name}`
    )
  );
});
