import { Team } from "@/models/Team";
// import { Tournament } from "@/models/Tournament";
import { Registration } from "@/models/Registration";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";
import mongoose from "mongoose";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export const PATCH = asyncHandler(async (req) => {
  const user = await requireAuth(req);

  const { fields } = await parseForm(req);
  const partnerId = fields.partnerId?.toString();
  let memberIds = [];

if (Array.isArray(fields.memberIds)) {
  memberIds = fields.memberIds.flatMap((item) =>
    item.split(",").map((id) => id.trim())
  );
} else if (typeof fields.memberIds === "string") {
  memberIds = fields.memberIds.split(",").map((id) => id.trim());
}

memberIds = memberIds
  .filter((id) => isValidObjectId(id))
  .map((id) => new mongoose.Types.ObjectId(id));

console.log("Normalized memberIds:", memberIds);

if (memberIds.length === 0) {
  throw new ApiResponse(400, null, "Invalid or missing memberIds");
}
  const team = await Team.findOne({ members: { $all: memberIds } })
    .populate("tournament")
    .populate("members", "firstname lastname username email")
    .populate("partner", "firstname lastname username email");

  if (!team) throw new ApiResponse(404, null, "Team not found");

  console.log("team==============:", team);

  console.log("user==============:", user);

  const tournament = team.tournament;
  if (!tournament) throw new ApiResponse(404, null, "Tournament not found");

  if (team.createdBy.toString() !== user._id.toString()) {
    throw new ApiResponse(403, null, "Only team owner can select partner");
  }

  if (!team.members.some((m) => m._id.toString() === partnerId)) {
    throw new ApiResponse(400, null, "Selected partner is not a team member");
  }

  const existingPartnerTeam = await Team.findOne({
    tournament: tournament._id,
    game: team.game,
    partner: partnerId,
    _id: { $ne: team._id },
  });

  if (existingPartnerTeam) {
    throw new ApiResponse(
      400,
      null,
      "This user is already a partner in another team"
    );
  }

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
