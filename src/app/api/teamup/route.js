// import { Registration } from "@/models/Registration";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import "@/models/Game";
import { parseForm } from "@/utils/server/parseForm";
// import { ApiError } from "@/utils/server/ApiError";
import { TeamUp } from "@/models/TeamUp";
import { Team } from "@/models/Team";
// import { Tournament } from "@/models/Tournament";
import { Registration } from "@/models/Registration";
// import { User } from "@/models/User";

export const POST = asyncHandler(async (req) => {
  const user = await requireAuth(req);
  const { fields } = await parseForm(req);

  const to = fields.to?.toString();
  const message = fields.message?.toString();
  if (!to) throw new ApiError(400, null, "Receiver user ID (to) is required");

  if (to.toString() === user._id.toString())
    throw new ApiError(400, null, "Cannot send team-up request to yourself");

  const request = await TeamUp.create({
    from: user._id,
    to,
    message,
  });

  return Response.json(
    new ApiResponse(201, request, "Team-up request sent successfully")
  );
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

  const userIds = [
    ...new Set([
      ...requests.map((r) => r.from._id.toString()),
      ...requests.map((r) => r.to._id.toString()),
    ]),
  ];

  // 3) Get registrations of these users
  const registrations = await Registration.find({ user: { $in: userIds } })
    .populate("tournament")
    .populate("gameRegistrationDetails.games")
    .lean();

  const requestsWithTournament = requests.map((req) => {
    const toRegs = registrations.filter(
      (r) => r.user.toString() === req.to._id.toString()
    );
    const toTournamentReg = toRegs.find(
      (r) => r.tournament && r?.gameRegistrationDetails?.games?.length > 0
    );

    return {
      ...req,
      tournament: toTournamentReg?.tournament,
      games: toTournamentReg?.gameRegistrationDetails?.games,
    };
  });

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
      { requests: requestsWithTournament, teams },
      "Fetched team-up requests & teams"
    )
  );
});
