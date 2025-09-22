import { Registration } from "@/models/Registration";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import "@/models/Game";
import { requireAuth } from "@/utils/server/auth";
import { requireAdmin } from "@/utils/server/roleGuards";
import { Tournament } from "@/models/Tournament";

export const GET = asyncHandler(async (_, context) => {
  const id = context.params?.id;
  const user = await requireAuth();
  // const adminUser = await requireAdmin();

  if (!id) throw new ApiResponse(400, null, "ID parameter is missing");

  let registeredGames;

  if (user?.role === "admin") {
    registeredGames = await Tournament.findById(id).populate("games.game");
  } else {
    registeredGames = await Registration.find({
      tournament: id,
      user: user?._id,
    }).populate("gameRegistrationDetails.games");
  }

  console.log("RegisteredGames: ===========", registeredGames);

  return Response.json(
    new ApiResponse(
      200,
      registeredGames,
      "Registered Games fetched successfully"
    )
  );
});
