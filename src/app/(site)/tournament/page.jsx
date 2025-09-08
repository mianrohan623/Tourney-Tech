"use client";

import { useState } from "react";

import TournamentCard from "@/components/ui/tournaments/TournamentCard";

import { tournaments } from "@/constants/tournament-listing-page/tournamentData";

import TournamentFilters from "@/components/ui/tournaments/TournamentFilters";


export default function TournamentListing() {
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    location: "",
    type: "",
    game: "",
  });

  const itemsPerPage = 6;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // reset to first page
  };

  const sortedTournaments = [...tournaments].sort((a, b) => {
    const order = { upcoming: 0, ongoing: 1, complete: 2 };
    return order[a.status] - order[b.status];
  });

  const filteredTournaments = sortedTournaments.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filters.status ? t.status === filters.status : true;
    const matchesLocation = filters.location
      ? t.location === filters.location
      : true;
    const matchesType = filters.type ? t.type === filters.type : true;
    const matchesGame = filters.game
      ? t.games.some((g) => g.name === filters.game)
      : true;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesLocation &&
      matchesType &&
      matchesGame
    );
  });

  const totalPages = Math.ceil(filteredTournaments.length / itemsPerPage);

  const paginatedTournaments = filteredTournaments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (

  
    <main
      className="min-h-screen py-16 px-4 md:px-8"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl font-extrabold text-center mb-12"
          style={{ color: "var(--accent-color)" }}
        >
          🎮 Explore Tournaments
        </h1>

        {/* Filters + Search */}
        <TournamentFilters
          filters={filters}
          onChange={handleFilterChange}
          search={search}
          onSearchChange={setSearch}
          tournamentData={tournaments}
        />

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {paginatedTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              {...tournament}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded font-semibold ${
                currentPage === index + 1
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
