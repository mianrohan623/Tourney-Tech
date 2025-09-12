import { Registration } from "@/models/Registration";
import { TeamUp } from "@/models/TeamUp";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import "@/models/Game";

export const GET = asyncHandler(async () => {
  const user = await requireAuth();

  const currentUserRegistrations = await Registration.find({
    user: user?._id,
    "gameRegistrationDetails.status": "approved",
  }).populate({
    path: "gameRegistrationDetails.games",
    model: "Game",
  });

  if (!currentUserRegistrations || currentUserRegistrations.length === 0) {
    return Response.json(
      new ApiResponse(404, null, "User is not registered in any tournament")
    );
  }

  let allMatchedUsers = [];

  for (const reg of currentUserRegistrations) {
    const tournamentId = reg.tournament;

    const gameDetailsArray = Array.isArray(reg.gameRegistrationDetails)
      ? reg.gameRegistrationDetails
      : [reg.gameRegistrationDetails].filter(Boolean);

    const gameIds = gameDetailsArray.flatMap((d) =>
      (Array.isArray(d.games) ? d.games : [d.games]).map((g) => g._id || g)
    );

    const matchingRegistrations = await Registration.find({
      tournament: tournamentId,
      "gameRegistrationDetails.games": { $in: gameIds },
      "gameRegistrationDetails.status": "approved",
      user: { $ne: user._id },
    })
      .populate({
        path: "user",
        model: "User",
        select: "-password -refreshToken -accessToken -__v",
      })
      .populate({
        path: "gameRegistrationDetails.games",
        model: "Game",
      });

    const matchedUsers = matchingRegistrations.map((r) => r.user);
    allMatchedUsers = [...allMatchedUsers, ...matchedUsers];
  }

  const uniqueMatchedUsers = Array.from(
    new Map(allMatchedUsers.map((u) => [u._id.toString(), u])).values()
  );

  // ✅ Pending requests nikaalo
  const pendingRequests = await TeamUp.find({
    from: user._id,
    status: "pending",
  }).select("to");

  // ✅ Accepted requests nikaalo (from ya to dono check karne honge)
  const acceptedRequests = await TeamUp.find({
    $or: [{ from: user._id }, { to: user._id }],
    status: "accepted",
  }).select("from to");

  const pendingUserIds = new Set(
    pendingRequests.map((req) => req.to.toString())
  );

  const acceptedUserIds = new Set(
    acceptedRequests.flatMap((req) => [
      req.from.toString(),
      req.to.toString(),
    ])
  );

  const matchedUsersWithFlags = uniqueMatchedUsers.map((u) => ({
    ...u.toObject(),
    isSendRequest: pendingUserIds.has(u._id.toString()),
    alreadyMember: acceptedUserIds.has(u._id.toString()),
  }));

  return Response.json(
    new ApiResponse(
      200,
      { currentUser: user, matchedUsers: matchedUsersWithFlags },
      "Fetched users with same tournament and same games"
    )
  );
});
