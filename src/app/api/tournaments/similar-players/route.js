import { Registration } from "@/models/Registration";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import "@/models/Game";
import { User } from "@/models/User";

export const GET = asyncHandler(async () => {
  const user = await requireAuth();

  const currentUserRegistrations = await Registration.find({
    user: user?._id,
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

    console.log("tournamentId:", tournamentId, "gameIds:", gameIds);

    const matchingRegistrations = await Registration.find({
      tournament: tournamentId,
      "gameRegistrationDetails.games": { $in: gameIds },
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

  return Response.json(
    new ApiResponse(
      200,
      { currentUser: user, matchedUsers: uniqueMatchedUsers },
      "Fetched users with same tournament and same games"
    )
  );
});

