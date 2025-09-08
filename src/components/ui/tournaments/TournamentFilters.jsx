export default function TournamentFilters({
  filters,
  onChange,
  search,
  onSearchChange,
  tournamentData,
}) {
  const uniqueLocations = [...new Set(tournamentData.map((t) => t.location))].sort();

 
  // Derive type from `teamBased`
  const uniqueTypes = [...new Set(
    tournamentData.map((t) => (t.teamBased ? "team" : "single"))
  )];

  const selectClass =
    "p-2 rounded border border-[var(--border-color)] bg-[var(--card-background)] text-[var(--foreground)]";

  const optionStyle = {
    backgroundColor: "var(--card-background)",
    color: "var(--foreground)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search by tournament name..."
        className={selectClass}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Status filter */}
      <select
        name="status"
        value={filters.status}
        onChange={onChange}
        className={selectClass}
      >
        <option value="" style={optionStyle}>All Status</option>
        <option value="upcoming" style={optionStyle}>Upcoming</option>
        <option value="ongoing" style={optionStyle}>Ongoing</option>
        <option value="completed" style={optionStyle}>Completed</option>
      </select>

      {/* Location filter */}
      <select
        name="location"
        value={filters.location}
        onChange={onChange}
        className={selectClass}
      >
        <option value="" style={optionStyle}>All Locations</option>
        {uniqueLocations.map((loc) => (
          <option key={loc} value={loc} style={optionStyle}>
            {loc}
          </option>
        ))}
      </select>

      {/* Type filter (derived from teamBased) */}
      <select
        name="type"
        value={filters.type}
        onChange={onChange}
        className={selectClass}
      >
        <option value="" style={optionStyle}>All Types</option>
        {uniqueTypes.map((type) => (
          <option key={type} value={type} style={optionStyle}>
            {type === "team" ? "Team Based" : "Solo"}
          </option>
        ))}
      </select>
    </div>
  );
}
