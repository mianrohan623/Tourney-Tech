"use client";
import { useState } from "react";

export default function TeamUp() {
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: "Test User",
      game: "PUBG",
      city: "Lahore",
      country: "Pakistan",
      requested: false,
    },
    {
      id: 2,
      name: "Abdullah",
      game: "PUBG",
      city: "Karachi",
      country: "Pakistan",
      requested: false,
    },
    {
      id: 3,
      name: "Dev",
      game: "Valorant",
      city: "Islamabad",
      country: "Pakistan",
      requested: false,
    },
    {
      id: 4,
      name: "Rohan",
      game: "PUBG",
      city: "Faisalabad",
      country: "Pakistan",
      requested: false,
    },
      {
      id: 5,
      name: "Ali",
      game: "PUBG",
      city: "Faisalabad",
      country: "Pakistan",
      requested: false,
    },
    {
      id: 6,
      name: "Adam",
      game: "PUBG",
      city: "New York",
      country: "USA",
      requested: false,
    },
    {
      id: 7,
      name: "John",
      game: "PUBG",
      city: "New York",
      country: "USA",
      requested: false,
    },
    {
      id: 8,
      name: "Jane",
      game: "PUBG",
      city: "New York",
      country: "USA",
      requested: false,
    },
  ]);

  const handleRequest = (id) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, requested: true } : p
      )
    );
  };

  const handleCancel = (id) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, requested: false } : p
      )
    );
  };

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-2xl font-bold mb-6">Team Up</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg px-4 py-2"
          style={{
            background: "var(--secondary-color)",
            border: `1px solid var(--border-color)`,
            color: "var(--foreground)",
          }}
        />
      </div>

      {/* Players Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="p-5 rounded-2xl shadow-md transition hover:shadow-lg"
              style={{
                background: "var(--card-background)",
                border: `1px solid var(--border-color)`,
              }}
            >
              <h2 className="text-lg font-semibold mb-2">{player.name}</h2>
              <p className="text-sm">
                <span className="font-semibold">Game:</span> {player.game}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Location:</span> {player.city},{" "}
                {player.country}
              </p>

              {!player.requested ? (
                <button
                  type="button"
                  className="mt-4 w-full font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                  style={{
                    background: "var(--accent-color)",
                    color: "black",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "var(--accent-hover)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "var(--accent-color)")
                  }
                  onClick={() => handleRequest(player.id)}
                >
                  Send Request
                </button>
              ) : (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 font-semibold py-2 px-4 rounded-lg shadow-md cursor-default"
                    style={{
                      background: "var(--success-color)",
                      color: "white",
                    }}
                  >
                    Requested
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg shadow-md font-semibold transition duration-200"
                    style={{
                      background: "var(--error-color)",
                      color: "white",
                    }}
                    onClick={() => handleCancel(player.id)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-sm opacity-75">
            No players found.
          </p>
        )}
      </div>
    </div>
  );
}
