"use client";

export default function TournamentGameList({ games }) {
  return (
    <div className="col-span-2">
      <p className="font-semibold">🎮 Games:</p>
      <ul className="list-disc ml-5 text-sm space-y-1">
        {games.map((g, i) => (
          <li key={g._id || i}>
            <strong>{g?.game?.name || "Unknown Game"}</strong> — Rs {g.entryFee ?? "0"} •{" "}
            {g.teamBased ? `Team of min player ${g.minPlayers} max player ${g.maxPlayers}` : "Single Player"}
          </li>
        ))}
      </ul>
    </div>
  );
}
