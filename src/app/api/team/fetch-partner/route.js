// GET /api/team/fetch-partner
import { Registration } from "@/models/Registration";
import { Team } from "@/models/Team";
// import { Tournament } from "@/models/Tournament";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
// import { parseForm } from "@/utils/server/parseForm";

export const GET = asyncHandler(async (req) => {
  const user = await requireAuth(req);

  const teams = await Team.find({ members: user._id })
    .populate("tournament")
    .populate("members", "firstname lastname username email")
    .lean();

    console.log("teams::=======", teams);
  const tournamentIds = teams.map((t) => t.tournament?._id);

  const registrations = await Registration.find({
    tournament: { $in: tournamentIds },
    user: user._id,
  })
    .populate("tournament")
    .populate("gameRegistrationDetails.games")
    .lean();

  const tournaments = teams.map((team) => {
    const gameConfig = team.tournament?.games.find(
      (g) => g.game.toString() === team.game.toString()
    );

    const registration = registrations.find(
      (r) => r.tournament?._id.toString() === team.tournament?._id.toString()
    );

    const partner =
      gameConfig?.tournamentTeamType === "double_player"
        ? team.members.find((m) => m._id.toString() !== user._id.toString())
        : null;

    return {
      _id: team.tournament?._id,
      name: team.tournament?.name,
      startDate: team.tournament?.startDate,
      endDate: team.tournament?.endDate,
      location: team.tournament?.location,
      status: team.tournament?.status,
      partner,
      registeredGames: registration?.gameRegistrationDetails?.games || [],
      tournament: team.tournament,
    };
  });

  return Response.json(
    new ApiResponse(
      200,
      tournaments,
      "Fetched tournaments with user partner + registered games"
    )
  );
});
