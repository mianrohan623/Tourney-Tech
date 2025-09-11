import { asyncHandler } from "@/utils/server/asyncHandler";
import { parseForm } from "@/utils/server/parseForm";
import { requireAdmin } from "@/utils/server/roleGuards";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { Team } from "@/models/Team";
// import { TeamUp } from "@/models/TeamUp";
// import { User } from "@/models/User"; // agar members check karna ho
import mongoose from "mongoose";

export const POST = asyncHandler(async (req) => {
  await requireAdmin();
  const { fields } = await parseForm(req);

  const { name, logo, tournament, game, members } = fields;

  if (!name || !tournament || !game || !members) {
    throw new ApiResponse(
      400,
      null,
      "Name, tournament, game and members are required"
    );
  }

  const memberIds = Array.isArray(members) ? members : [members];

  if (memberIds.length !== 2) {
    throw new ApiResponse(
      400,
      null,
      "Exactly 2 members are required to create a team"
    );
  }

  if (!memberIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
    throw new ApiResponse(400, null, "Invalid member IDs");
  }

  const existingTeam = await Team.findOne({
    tournament,
    game,
    members: { $in: memberIds },
  });

  if (existingTeam) {
    throw new ApiResponse(
      400,
      null,
      "One or both users are already in a team for this tournament and game"
    );
  }

  const team = await Team.create({
    name,
    logo: logo || null,
    tournament,
    game,
    createdBy: memberIds[0],
    members: memberIds,
  });

  return Response.json(new ApiResponse(201, team, "Team created successfully"));
});
