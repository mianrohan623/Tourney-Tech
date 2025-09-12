// import { Registration } from "@/models/Registration";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import "@/models/Game";
import { parseForm } from "@/utils/server/parseForm";
// import { ApiError } from "@/utils/server/ApiError";
import { TeamUp } from "@/models/TeamUp";
import { Team } from "@/models/Team";
import { User } from "@/models/User";

export const POST = asyncHandler(async (req) => {
  await requireAdmin();
  const { fields } = await parseForm(req);

  const { logo, tournament, game, members } = fields;

  if (!tournament || !game || !members) {
    throw new ApiResponse(
      400,
      null,
      "Tournament, game and members are required"
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

  // check if members are already in a team
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

  const users = await User.find({ _id: { $in: memberIds } }).select("username");

  if (users.length !== 2) {
    throw new ApiResponse(400, null, "Both users must exist");
  }

  const teamName = `${users[0].username}_${users[1].username}`;

  const team = await Team.create({
    name: teamName,
    logo: logo || null,
    tournament,
    game,
    createdBy: memberIds[0],
    members: memberIds,
  });

  return Response.json(new ApiResponse(201, team, "Team created successfully"));
});


export const GET = asyncHandler(async () => {
  const user = await requireAuth();

  // get requests (pending + accepted)
  const requests = await TeamUp.find({
    $or: [{ from: user._id }, { to: user._id }],
    status: { $in: ["pending", "accepted"] },
  })
    .populate("from", "firstname lastname username email")
    .populate("to", "firstname lastname username email")
    .lean();

  // get teams only for accepted requests
  const acceptedUserIds = requests
    .filter((r) => r.status === "accepted")
    .flatMap((r) => [r.from._id.toString(), r.to._id.toString()]);

  let teams = [];
  if (acceptedUserIds.length > 0) {
    teams = await Team.find({
      members: { $in: acceptedUserIds },
    })
      .populate("game")
      .populate("tournament")
      .populate("createdBy", "firstname lastname username email")
      .populate("members", "firstname lastname username email")
      .lean();
  }

  return Response.json(
    new ApiResponse(
      200,
      { requests, teams },
      "Fetched team-up requests & teams"
    )
  );
});
