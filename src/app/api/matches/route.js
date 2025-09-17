// POST /api/matches/create
import { Team } from "@/models/Team";
import { Match } from "@/models/Match";
import { Tournament } from "@/models/Tournament";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";
import "@/models/Game";

// ✅ Utility: shuffle array
function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// ✅ Round Robin pair generator
function generateRoundRobin(teams) {
  const fixtures = [];
  const n = teams.length;

  // Agar odd teams hain → ek dummy team add karo (bye system)
  const hasDummy = n % 2 !== 0;
  const allTeams = [...teams];
  if (hasDummy) {
    allTeams.push({ _id: "dummy" });
  }

  const total = allTeams.length;

  for (let round = 0; round < total - 1; round++) {
    for (let i = 0; i < total / 2; i++) {
      const t1 = allTeams[i];
      const t2 = allTeams[total - 1 - i];
      if (t1._id !== "dummy" && t2._id !== "dummy") {
        fixtures.push([t1, t2]);
      }
    }
    // rotate array except first element
    allTeams.splice(1, 0, allTeams.pop());
  }

  return fixtures;
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

  // ✅ Total rounds
  const totalRounds = gameDetail.rounds;

  // ✅ Existing matches check (to avoid duplicate creation)
  const existingMatches = await Match.find({ tournament, game });
  let matchNumber = existingMatches.length + 1;

  const matches = [];

  // ✅ Round Robin fixtures generate
  const baseFixtures = generateRoundRobin(teams);

  for (let round = 1; round <= totalRounds; round++) {
    // ✅ shuffle each round fixtures to randomize order
    const roundFixtures = shuffleArray([...baseFixtures]);

    for (const [teamA, teamB] of roundFixtures) {
      // ✅ duplicate check (same round same match not allowed)
      const existing = await Match.findOne({
        tournament,
        game,
        round,
        $or: [
          { teamA: teamA._id, teamB: teamB._id },
          { teamA: teamB._id, teamB: teamA._id },
        ],
      });
      if (existing) continue;

      const match = await Match.create({
        tournament,
        game,
        matchNumber,
        round: 1,
        stage: "group",
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
