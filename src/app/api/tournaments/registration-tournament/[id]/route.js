import { Registration } from "@/models/Registration";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import "@/models/Game";
import { requireAuth } from "@/utils/server/auth";

export const GET = asyncHandler(async (_, context) => {
  const id = context.params?.id;
  const user = await requireAuth();

  if (!id) throw new ApiResponse(400, null, "ID parameter is missing");

  const RegisteredGames = await Registration.find({
    tournament: id,
    user: user?._id,
  }).populate("gameRegistrationDetails.games");
  return Response.json(
    new ApiResponse(
      200,
      RegisteredGames,
      "Registered Games fetched successfully"
    )
  );
});
