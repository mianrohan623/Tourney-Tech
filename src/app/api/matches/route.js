import { Team } from "@/models/Team";
import { Match } from "@/models/Match";
import { Tournament } from "@/models/Tournament";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";
import "@/models/Game";

// Utility: shuffle array
function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// Generate all unique team pairings for round-robin
function generateRoundRobinSchedule(teams, numRounds) {
  const n = teams.length;
  const allTeams = shuffleArray([...teams]); // Randomize initial order
  const schedule = [];
  const allPairs = [];

  // Generate all possible unique pairs
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      allPairs.push([allTeams[i], allTeams[j]]);
    }
  }

  // Shuffle all pairs to randomize match order
  const shuffledPairs = shuffleArray([...allPairs]);

  // Distribute pairs across rounds
  const matchesPerRound = Math.ceil(shuffledPairs.length / numRounds);
  for (let r = 0; r < numRounds; r++) {
    const start = r * matchesPerRound;
    const end = Math.min(start + matchesPerRound, shuffledPairs.length);
    const roundFixtures = shuffledPairs.slice(start, end);
    schedule.push(roundFixtures);
  }

  return schedule;
}

export const POST = asyncHandler(async (req) => {
  const user = await requireAuth(req);

  const { fields } = await parseForm(req);
  const { tournamentId: tournament, gameId: game } = fields;

  if (!tournament || !game) {
    throw new ApiResponse(400, null, "Tournament ID and Game ID are required");
  }

  // Tournament fetch
  const tournamentDoc = await Tournament.findById(tournament);
  if (!tournamentDoc) {
    throw new ApiResponse(404, null, "Tournament not found");
  }

  const gameDetail = tournamentDoc.games?.find(
    (v) => v?.game.toString() === game
  );
  if (!gameDetail) throw new ApiResponse(400, null, "Game not found");

  // Teams fetch
  const teams = await Team.find({ tournament, game });
  if (teams.length < 2) {
    throw new ApiResponse(400, null, "Not enough teams to create matches");
  }

  console.log("teams:", teams);

  // Calculate total rounds for full round-robin
  const originalN = teams.length;
  const totalRounds = gameDetail.rounds || originalN - 1; // Use gameDetail.rounds or n-1

  // Existing matches check (all matches for this tournament/game)
  const existingMatches = await Match.find({ tournament, game });
  let matchNumber = existingMatches.length + 1;

  const matches = [];

  // Generate full Round Robin schedule
  const schedule = generateRoundRobinSchedule(teams, totalRounds);

  // Create matches for each round
  for (let roundNum = 1; roundNum <= totalRounds; roundNum++) {
    const roundFixtures = schedule[roundNum - 1] || []; // Handle empty rounds

    // Shuffle fixtures for this round to randomize order
    const shuffledRound = shuffleArray([...roundFixtures]);

    for (const [teamA, teamB] of shuffledRound) {
      // Global duplicate check: same pair shouldn't exist already
      const existingPair = await Match.findOne({
        tournament,
        game,
        $or: [
          { teamA: teamA._id, teamB: teamB._id },
          { teamA: teamB._id, teamB: teamA._id },
        ],
      });
      if (existingPair) continue;

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
      `Group matches created successfully for ${totalRounds} rounds`
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
