import { Team } from "@/models/Team";
// import { Tournament } from "@/models/Tournament";
import { Registration } from "@/models/Registration";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";

export const PATCH = asyncHandler(async (req) => {
  const user = await requireAuth(req);

  const { fields } = await parseForm(req);
  const teamId = fields.teamId?.toString();
  const partnerId = fields.partnerId?.toString();

  // ✅ Team with tournament
  const team = await Team.findById(teamId)
    .populate("tournament")
    .populate("members", "firstname lastname username email")
    .populate("partner", "firstname lastname username email");

  if (!team) throw new ApiResponse(404, null, "Team not found");

  const tournament = team.tournament;
  if (!tournament) throw new ApiResponse(404, null, "Tournament not found");

  // ✅ Sirf team owner select kar sakta hai
  if (team.createdBy.toString() !== user._id.toString()) {
    throw new ApiResponse(403, null, "Only team owner can select partner");
  }

  // ✅ Partner must be in members[]
  if (!team.members.some((m) => m._id.toString() === partnerId)) {
    throw new ApiResponse(400, null, "Selected partner is not a team member");
  }

  const existingPartnerTeam = await Team.findOne({
    tournament: tournament._id,
    game: team.game,
    partner: partnerId,
    _id: { $ne: team._id }, // apni team exclude
  });

  if (existingPartnerTeam) {
    throw new ApiResponse(
      400,
      null,
      "This user is already a partner in another team"
    );
  }

  // ✅ Check registrations for both users in same tournament & same game
  const [ownerReg, partnerReg] = await Promise.all([
    Registration.findOne({
      tournament: tournament._id,
      user: team.createdBy,
      "gameRegistrationDetails.games": team.game,
    }).populate("gameRegistrationDetails.games"),

    Registration.findOne({
      tournament: tournament._id,
      user: partnerId,
      "gameRegistrationDetails.games": team.game,
    }).populate("gameRegistrationDetails.games"),
  ]);

  if (!ownerReg || !partnerReg) {
    throw new ApiResponse(
      400,
      null,
      "Both users must be registered in this game for the tournament"
    );
  }

  // ✅ Save partner
  team.partner = partnerId;
  await team.save();

  // ✅ Response with tournament + users’ registered games
  return Response.json(
    new ApiResponse(
      200,
      {
        team,
        tournament: {
          ...tournament.toObject(),
          ownerRegisteredGames: ownerReg.gameRegistrationDetails.games,
          partnerRegisteredGames: partnerReg.gameRegistrationDetails.games,
        },
      },
      "Partner selected successfully"
    )
  );
});
