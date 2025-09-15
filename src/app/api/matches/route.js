// POST /api/matches/create
import { Team } from "@/models/Team";
import { Match } from "@/models/Match";
import { Tournament } from "@/models/Tournament";
import { BracketGroup } from "@/models/BracketGroup";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parse";

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export const POST = asyncHandler(async (req) => {
  const user = await requireAuth(req);

  const { fields } = await parseForm(req);
  const { tournamentId: tournament, gameId: game } = fields;

  if (!tournament || !game) {
    throw new ApiResponse(400, null, "Tournament ID and Game ID are required");
  }

  // ✅ Tournament fetch karo
  const tournamentDoc = await Tournament.findById(tournament);
  if (!tournamentDoc) {
    throw new ApiResponse(404, null, "Tournament not found");
  }

  // ✅ Teams fetch karo
  const teams = await Team.find({ tournament, game });
  if (teams.length < 2) {
    throw new ApiResponse(400, null, "Not enough teams to create matches");
  }

  // ✅ Round calculate karo
  const existingMatches = await Match.find({ tournament, game });
  const round = Math.floor(existingMatches.length / (teams.length / 2)) + 1;

  // ✅ Teams shuffle
  const shuffledTeams = shuffleArray(teams);

  // ✅ Bracket group check/create
  let bracketGroup = await BracketGroup.findOne({
    tournament,
    game,
    name: `Round ${round} - Winner Bracket`,
  });

  if (!bracketGroup) {
    bracketGroup = await BracketGroup.create({
      tournament,
      game,
      name: `Round ${round} - Winner Bracket`,
      order: round,
      bracketSide: "winner",
    });
  }

  // ✅ Matches create
  const matches = [];
  let matchNumber = existingMatches.length + 1;

  for (let i = 0; i < shuffledTeams.length; i += 2) {
    const teamA = shuffledTeams[i];
    const teamB = shuffledTeams[i + 1];

    if (!teamB) continue; // Odd team bach jaye toh skip

    const match = await Match.create({
      tournament,
      game,
      matchNumber,
      bracketGroup: bracketGroup._id,
      round,
      teamA: teamA._id,
      teamB: teamB._id,
      admin: user._id,
    });

    matches.push(match);
    matchNumber++;
  }

  return Response.json(
    new ApiResponse(201, matches, `Round ${round} matches created successfully`)
  );
});




export const GET = asyncHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get("tournamentId");

  const filter = {};
  if (tournamentId) filter.tournament = tournamentId;

  const matches = await Match.find(filter)
    .populate("tournament")
    .populate("game")
    .populate("bracketGroup")
    .populate("teamA")
    .populate("teamB")
    .populate("admin");

  return Response.json(
    new ApiResponse(200, matches, "Matches fetched successfully")
  );
});
