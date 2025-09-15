import { Match } from "@/models/Match";
import { Team } from "@/models/Team";
import { BracketGroup } from "@/models/BracketGroup";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";

function shuffleArray(array) {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

export const POST = asyncHandler(async (req) => {
  const user = await requireAuth(req);

  const { fields } = await parseForm(req);
  const { tournamentId: tournament, gameId: game } = fields;

  if (!tournament || !game) {
    throw new ApiResponse(400, null, "Tournament ID and Game ID are required");
  }

  const teams = await Team.find({ tournament, game });
  if (teams.length < 2) {
    throw new ApiResponse(400, null, "Not enough teams to create matches");
  }

  const shuffledTeams = shuffleArray(teams);

  let bracketGroup = await BracketGroup.findOne({
    tournament,
    game,
    name: "Round 1 - Winner Bracket",
  });

  if (!bracketGroup) {
    bracketGroup = await BracketGroup.create({
      tournament,
      game,
      name: "Round 1 - Winner Bracket",
      order: 1,
      bracketSide: "winner",
    });
  }

  const matches = [];
  let matchNumber = 1;

  for (let i = 0; i < shuffledTeams.length; i += 2) {
    const teamA = shuffledTeams[i];
    const teamB = shuffledTeams[i + 1];

    if (!teamB) {
      continue;
    }

    const match = await Match.create({
      tournament,
      game,
      matchNumber,
      bracketGroup: bracketGroup._id,
      round: 1,
      teamA: teamA._id,
      teamB: teamB._id,
      admin: user._id,
    });

    matches.push(match);
    matchNumber++;
  }

  return Response.json(
    new ApiResponse(201, matches, "Matches created successfully")
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
