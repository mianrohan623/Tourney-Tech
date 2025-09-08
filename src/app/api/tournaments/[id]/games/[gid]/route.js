// src\app\api\tournaments\[id]\games\[gid]\route.js

import { Tournament } from "@/models/Tournament";
import { requireAuth } from "@/utils/server/auth";
import { requireTournamentStaff } from "@/utils/server/tournamentPermissions";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { ApiError } from "@/utils/server/ApiError";

// PATCH /api/tournaments/:id/games/:gid → Update a tournament game's config
export const PATCH = asyncHandler(async (req, context) => {
  const user = await requireAuth(req);
  const params = await context.params;
  const tournamentId = params.id;
  const gameConfigId = params.gid;

  const body = await req.json();

  await requireTournamentStaff(tournamentId, user, [
    "admin",
    "owner",
    "organizer",
  ]);

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new ApiError(404, "Tournament not found");

  const game = tournament.games.id(gameConfigId);
  if (!game) throw new ApiError(404, "Game config not found");

  const allowedFields = [
    "entryFee",
    "format",
    "teamBased",
    "minPlayers",
    "maxPlayers",
  ];
  allowedFields.forEach((field) => {
    if (field in body) game[field] = body[field];
  });

  if (game.minPlayers > game.maxPlayers) {
    throw new ApiError(400, "minPlayers cannot be greater than maxPlayers");
  }

  await tournament.save();

  return Response.json({ success: true, updatedGame: game });
});

// DELETE /api/tournaments/:id/games/:gid → Remov egame from tournament
export const DELETE = asyncHandler(async (req, context) => {
  const user = await requireAuth(req);
  const params = await context.params;
  const tournamentId = params.id;
  const gameConfigId = params.gid;

  await requireTournamentStaff(tournamentId, user, [
    "admin",
    "owner",
    "organizer",
  ]);

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) throw new ApiError(404, "Tournament not found");

  const found = tournament.games.id(gameConfigId);
  if (!found) throw new ApiError(404, "Game config not found");

  tournament.games.pull(gameConfigId);
  await tournament.save();

  return Response.json({ success: true, removedGame: gameConfigId });
});
