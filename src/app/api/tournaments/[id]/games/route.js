import { Tournament } from "@/models/Tournament";
import { Game } from "@/models/Game";
import { requireAuth } from "@/utils/server/auth";
import { requireTournamentStaff } from "@/utils/server/tournamentPermissions";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { ApiError } from "@/utils/server/ApiError";

// POST /api/tournaments/:id/games → Add game to tournament
export const POST = asyncHandler(async (req, context) => {
  const user = await requireAuth(req);
  const params = await context.params;
  const tournamentId = params.id;

  const body = await req.json();

  await requireTournamentStaff(tournamentId, user, [
    "admin",
    "owner",
    "organizer",
  ]);

  const {
    game,
    entryFee = 0,
    format,
    teamBased = true,
    minPlayers,
    maxPlayers,
  } = body;

  if (!game || !format || !minPlayers || !maxPlayers) {
    throw new ApiError(400, "Missing required fields");
  }

  if (minPlayers > maxPlayers) {
    throw new ApiError(400, "minPlayers cannot be greater than maxPlayers");
  }

  const validFormats = [
    "single_elimination",
    "double_elimination",
    "round_robin",
  ];
  if (!validFormats.includes(format)) {
    throw new ApiError(400, "Invalid format");
  }

  const gameExists = await Game.exists({ _id: game });
  if (!gameExists) {
    throw new ApiError(404, "Game not found");
  }

  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) throw new ApiError(404, "Tournament not found");

  const alreadyExists = tournament.games.some(
    (g) => g.game.toString() === game
  );
  if (alreadyExists) {
    throw new ApiError(409, "Game already added to this tournament");
  }

  tournament.games.push({
    game,
    entryFee,
    format,
    teamBased,
    minPlayers,
    maxPlayers,
  });
  await tournament.save();

  return Response.json({ success: true, tournamentId, addedGame: game });
});

// GET /api/tournaments/:id/games → List all configured games
export const GET = asyncHandler(async (_req, context) => {
  const params = await context.params;
  const tournamentId = params.id;

  const tournament = await Tournament.findById(tournamentId)
    .populate("games.game")
    .select("games");

  if (!tournament) throw new ApiError(404, "Tournament not found");

  return Response.json({ games: tournament.games });
});
