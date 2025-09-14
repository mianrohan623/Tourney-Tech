"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

// ✅ Reusable Searchable Select
function SearchableSelect({ label, options, value, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full">
      <label className="block text-sm mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={query || value?.label || ""}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg bg-[var(--secondary-color)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        />
        {isOpen && (
          <ul className="absolute z-10 w-full max-h-40 overflow-y-auto bg-[var(--card-background)] border border-[var(--border-color)] rounded-lg mt-1 shadow-lg scrollbar">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    onChange(opt);
                    setQuery(opt.label);
                    setIsOpen(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-[var(--card-hover)]"
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-400">No results</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function TeamForm() {
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [teamTypes, setTeamTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    tournament: null,
    game: null,
    members: [],
    tournamentTeamType: null,
  });

  // ✅ Load tournaments on mount
  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await api.get("/api/tournaments");
        setTournaments(
          res.data.data.map((t) => ({
            value: t._id,
            label: t.name,
            games: t.games,
            teamTypes: t.teamTypes || ["single_player", "double_player"],
          }))
        );
      } catch (err) {
        toast.error("Failed to load tournaments");
      }
    }
    fetchTournaments();
  }, []);

  // ✅ Set games and team types when tournament changes
  useEffect(() => {
    if (form.tournament) {
      const selectedTournament = tournaments.find(
        (t) => t.value === form.tournament.value
      );
      if (selectedTournament) {
        setGames(
          selectedTournament.games.map((g) => ({
            value: g._id,
            label: g.game.name,
          }))
        );

        setTeamTypes(
          selectedTournament.teamTypes.map((t) => ({
            value: t,
            label: t === "single_player" ? "Single Player" : "Double Player",
          }))
        );
      }
    } else {
      setGames([]);
      setTeamTypes([]);
    }

    setForm((prev) => ({
      ...prev,
      game: null,
      members: [],
      tournamentTeamType: null,
    }));
  }, [form.tournament, tournaments]);

  // ✅ Fetch available members (only if tournament is selected)
  useEffect(() => {
    async function fetchMembers() {
      if (!form.tournament) {
        setUsers([]);
        return;
      }

      try {
        const url = `/api/tournaments/${form.tournament.value}/similar-players/unassigned-users`;
        const res = await api.get(url);
        setUsers(
          res.data.data.unassignedUsers.map((u) => ({
            value: u._id,
            label: `${u.firstname} ${u.lastname} (${u.username})`,
          }))
        );
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load members");
        setUsers([]);
      }
    }

    fetchMembers();
  }, [form.tournament]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tournament || !form.game || !form.tournamentTeamType) {
      toast.error("Tournament, game, and team type are required");
      return;
    }

    if (
      form.tournamentTeamType.value === "double_player" &&
      form.members.length !== 2
    ) {
      toast.error("Exactly 2 members required for double player teams");
      return;
    }

    if (
      form.tournamentTeamType.value === "single_player" &&
      form.members.length !== 1
    ) {
      toast.error("Exactly 1 member required for single player teams");
      return;
    }

    try {
      await api.post("/api/team", {
        tournament: form.tournament.value,
        game: form.game.value,
        members: form.members, // IDs only
        tournamentTeamType: form.tournamentTeamType.value,
      });

      toast.success("Team created successfully");
      setForm({
        tournament: null,
        game: null,
        members: [],
        tournamentTeamType: null,
      });
      setUsers([]);
      setGames([]);
      setTeamTypes([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create team");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-[var(--card-background)] rounded-xl shadow-md space-y-4"
    >
      <h2 className="text-xl font-bold mb-2">Create Team</h2>

      <SearchableSelect
        label="Tournament"
        options={tournaments}
        value={form.tournament}
        onChange={(val) => setForm({ ...form, tournament: val })}
        placeholder="Select tournament"
      />

      {form.tournament && (
        <SearchableSelect
          label="Game"
          options={games}
          value={form.game}
          onChange={(val) => setForm({ ...form, game: val })}
          placeholder="Select game..."
        />
      )}

      <SearchableSelect
        label="Team Type"
        options={
          teamTypes.length > 0
            ? teamTypes
            : [
                { value: "single_player", label: "Single Player" },
                { value: "double_player", label: "Double Player" },
              ]
        }
        value={form.tournamentTeamType}
        onChange={(val) => setForm({ ...form, tournamentTeamType: val })}
        placeholder="Select team type..."
      />

      <SearchableSelect
        label="Member 1"
        options={users}
        value={users.find((u) => u.value === form.members[0]) || null}
        onChange={(val) =>
          setForm({ ...form, members: [val.value, form.members[1] || null] })
        }
        placeholder="Select first member..."
      />

      {form.tournamentTeamType?.value === "double_player" && (
        <SearchableSelect
          label="Member 2"
          options={users}
          value={users.find((u) => u.value === form.members[1]) || null}
          onChange={(val) =>
            setForm({ ...form, members: [form.members[0] || null, val.value] })
          }
          placeholder="Select second member..."
        />
      )}

      <button
        type="submit"
        className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white py-2 px-4 rounded-lg transition"
      >
        Create Team
      </button>
    </form>
  );
}
