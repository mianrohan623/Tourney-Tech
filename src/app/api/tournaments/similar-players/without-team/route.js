// GET /api/tournaments/:tournamentId/unassigned-users
import { Registration } from "@/models/Registration";
import { Team } from "@/models/Team";
import { Tournament } from "@/models/Tournament";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { requireAdmin } from "@/utils/server/roleGuards";

export const GET = asyncHandler(async (req, context) => {
  await requireAdmin(req);
  const { tournamentId } = context.params;

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    return Response.json(new ApiResponse(404, null, "Tournament not found"));
  }

  // ✅ Tournament ke sab registrations
  const registrations = await Registration.find({
    tournament: tournamentId,
    "gameRegistrationDetails.status": "approved",
  }).populate({
    path: "user",
    model: "User",
    select: "-password -refreshToken -accessToken -__v",
  });

  // ✅ Tournament ki sab teams
  const teams = await Team.find({ tournament: tournamentId });

  // ✅ Team members ka set banao
  const assignedUserIds = new Set();
  teams.forEach((team) => {
    assignedUserIds.add(team.createdBy.toString());
    team.members.forEach((m) => assignedUserIds.add(m.toString()));
    if (team.partner) {
      assignedUserIds.add(team.partner.toString());
    }
  });

  // ✅ Filter un users ko jo assigned list me nahi hain
  const unassignedUsers = registrations
    .map((r) => r.user)
    .filter((u) => !assignedUserIds.has(u._id.toString()));

  return Response.json(
    new ApiResponse(
      200,
      { unassignedUsers },
      "Fetched users who are registered but not in any team of this tournament"
    )
  );
});
