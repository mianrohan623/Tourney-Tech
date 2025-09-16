"use client";

import Link from "next/link";

export default function GameCardUI() {
  return (
    <div
      className="flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-lg hover:scale-[1.01] transition-transform border border-gray-700"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      {/* Game Image */}
      <img
        src="https://via.placeholder.com/400x200"
        alt="Game banner"
        className="w-full sm:w-1/3 h-48 sm:h-auto object-cover"
      />

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Header */}
        <h2 className="text-xl font-bold">Game Name</h2>

        {/* Description */}
        <p className="text-gray-400 text-sm line-clamp-3">
          This is a short description of the game. It explains the gameplay,
          style, and why it’s fun.
        </p>

        {/* Game Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-300">
          <p>
            🎮 <strong>Type:</strong> Multiplayer
          </p>
          <p>
            🕹 <strong>Format:</strong> Battle Royale
          </p>
          <p>
            💰 <strong>Price:</strong> $19.99
          </p>
          <p>
            🏷 <strong>Genre:</strong> Action
          </p>
        </div>

        {/* Button */}
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <Link href="#" className="flex-1">
            <button
              className="w-full py-2 rounded-lg font-semibold transition hover:scale-[1.01]"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--background)",
              }}
            >
              Play Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
