// PATCH /api/team/:teamId/select-partner
import { Team } from "@/models/Team";
import { Tournament } from "@/models/Tournament";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";

export const PATCH = asyncHandler(async (req, context) => {
  const user = await requireAuth(req);
  //   const { teamId } = context.params;
  //   const { partnerId } = await req.json();

  const { fields } = await parseForm(req);

  const teamId = fields.teamId?.toString();
  const partnerId = fields.partnerId?.toString();

  const team = await Team.findById(teamId).populate("tournament");
  if (!team) throw new ApiResponse(404, "Team not found");

  const tournament = await Tournament.findById(team.tournament);
  if (!tournament) throw new ApiResponse(404, "Tournament not found");

  // ✅ Sirf team owner select kar sakta hai
  if (team.createdBy.toString() !== user._id.toString()) {
    throw new ApiResponse(403, "Only team owner can select partner");
  }

  // ✅ Check if tournament is double_player type
  const gameConfig = tournament.games.find(
    (g) => g._id.toString() === team.game.toString()
  );
  if (!gameConfig) throw new ApiResponse(400, "Game config not found");

  if (gameConfig.tournamentTeamType !== "double_player") {
    throw new ApiResponse(
      400,
      "Partner selection is only allowed for double_player tournaments"
    );
  }

  // ✅ Partner must be in members[]
  if (!team.members.some((m) => m.toString() === partnerId)) {
    throw new ApiResponse(400, "Selected partner is not a team member");
  }

  // ✅ Save partner
  team.partner = partnerId;
  await team.save();

  return Response.json(
    new ApiResponse(200, team, "Partner selected successfully")
  );
});
