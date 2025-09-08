"use client";

import TournamentGameList from "./TournamentGameList";

export default function TournamentCard({
  _id,
  name,
  games,
  startDate,
  endDate,
  location,
  bannerUrl,
  description,
  status,
  selectedId,
  onSelect,
}) {
  const isSelected = selectedId === _id;

  const getStatusColor = () => {
    switch (status) {
      case "complete":
        return "var(--error-color)";
      case "ongoing":
        return "var(--success-color)";
      case "upcoming":
        return "var(--info-color)";
      default:
        return "var(--accent-color)";
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "N/A";
  const formatTime = (date) =>
    date
      ? new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  return (
    <div
      className="flex flex-col sm:flex-row rounded-xl overflow-hidden shadow-lg hover:scale-[1.01] transition-transform border border-gray-700"
      style={{ backgroundColor: "var(--card-background)" }}
    >
      {/* Image */}
      <img
        src={bannerUrl}
        alt={name || "Tournament banner"}
        className="w-full sm:w-1/3 h-48 sm:h-auto object-cover"
      />

      {/* Content */}
      <div className="flex-1 p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold">{name}</h2>
            <span
              className="inline-block mt-1 px-3 py-1 text-xs rounded-full font-semibold"
              style={{
                backgroundColor: getStatusColor(),
                color: "var(--background)",
              }}
            >
              {status?.toUpperCase()}
            </span>
          </div>

          <div>
            <span
              className="inline-block px-3 py-1 text-sm rounded-full font-medium"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "var(--background)",
              }}
            >
              {games?.[0]?.entryFee ? `Fee: ${games[0].entryFee}` : "Free"}
            </span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-gray-400 text-sm line-clamp-3">{description}</p>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-300">
          <p>
            📍 <strong>Location:</strong> {location || ""}
          </p>
          <p>
            📅 <strong>Start:</strong>
            {formatDate(startDate)}
          </p>
          <p>
            📅 <strong>End:</strong>
            {formatDate(endDate)}
          </p>
          <p>
            ⏰ <strong>Time:</strong>
            {formatTime(startDate)}
          </p>
        </div>

        {/* Games */}
        <TournamentGameList games={games || []} />

        {/* Button */}
        <button
          onClick={() => onSelect(_id)}
          className="w-full mt-3 py-2 rounded-lg font-semibold transition hover:scale-[1.01]"
          style={{
            backgroundColor: isSelected
              ? "var(--primary-hover)"
              : "var(--accent-color)",
            color: isSelected ? "var(--foreground)" : "var(--background)",
          }}
        >
          {isSelected ? "✔ Entered" : "Enter Tournament"}
        </button>
      </div>
    </div>
  );
}
