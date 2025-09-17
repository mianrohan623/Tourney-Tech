// POST /api/matches/create
import { Team } from "@/models/Team";
import { Match } from "@/models/Match";
import { Tournament } from "@/models/Tournament";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";
import "@/models/Game";

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

  // ✅ Tournament fetch
  const tournamentDoc = await Tournament.findById(tournament);
  if (!tournamentDoc) {
    throw new ApiResponse(404, null, "Tournament not found");
  }

  const gameDetail = tournamentDoc.games?.find(
    (v) => v?.game.toString() === game
  );
  if (!gameDetail) throw new ApiResponse(400, null, "Game not found");

  // ✅ Teams fetch
  const teams = await Team.find({ tournament, game });
  if (teams.length < 2) {
    throw new ApiResponse(400, null, "Not enough teams to create matches");
  }

  // ✅ Total rounds (from tournament setting)
  const totalRounds = gameDetail.rounds;

  // ✅ Existing matches check (to avoid duplicate creation)
  const existingMatches = await Match.find({ tournament, game });
  let matchNumber = existingMatches.length + 1;

  const matches = [];

  // ✅ Loop over total rounds
  for (let round = 1; round <= totalRounds; round++) {
    // ✅ Shuffle teams fresh for each round
    const shuffledTeams = shuffleArray([...teams]);

    for (let i = 0; i < shuffledTeams.length; i += 2) {
      const teamA = shuffledTeams[i];
      const teamB = shuffledTeams[i + 1];

      if (!teamB) continue; // odd team skip

      const match = await Match.create({
        tournament,
        game,
        matchNumber,
        round: 1,
        stage: "group", // group matches
        teamA: teamA._id,
        teamB: teamB._id,
        admin: user._id,
      });

      matches.push(match);
      matchNumber++;
    }
  }

  return Response.json(
    new ApiResponse(
      201,
      matches,
      `Group matches created successfully with ${totalRounds} rounds`
    )
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
