// GET /api/team/fetch-partner
import { Team } from "@/models/Team";
import { Tournament } from "@/models/Tournament";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";


export const GET = asyncHandler(async (req) => {
  const user = await requireAuth(req);

  // ✅ Find all teams where user is member
  const teams = await Team.find({ members: user._id })
    .populate("tournament")
    .populate("partner", "firstname lastname username email")
    .populate("members", "firstname lastname username email")
    .lean();

  // ✅ Group tournaments
  const tournaments = teams.map((team) => {
    const gameConfig = team.tournament?.games.find(
      (g) => g._id.toString() === team.game.toString()
    );

    return {
      _id: team.tournament?._id,
      name: team.tournament?.name,
      startDate: team.tournament?.startDate,
      endDate: team.tournament?.endDate,
      location: team.tournament?.location,
      status: team.tournament?.status,
      partner:
        gameConfig?.tournamentTeamType === "double_player"
          ? team.partner
          : null,
    };
  });

  return Response.json(
    new ApiResponse(
      200,
      tournaments,
      "Fetched tournaments with user partner info"
    )
  );
});
