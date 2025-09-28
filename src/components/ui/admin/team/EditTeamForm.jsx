"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

// ✅ Reusable searchable dropdown
function SearchableSelect({ label, options, value, onChange, placeholder }) {
  const [query, setQuery] = useState(value?.label || "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        if (!value) setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  // ✅ Keep input synced with selected value
  useEffect(() => {
    if (value) {
      setQuery(value.label);
    } else {
      setQuery("");
    }
  }, [value]);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full" ref={containerRef}>
      {label && <label className="block text-sm mb-1">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value === "") {
              onChange(null); // ✅ Clear selection when input cleared
            }
          }}
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

export default function EditTeamForm({ team, onClose, onUpdated }) {
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    tournament: null,
    game: null,
    members: [],
    tournamentTeamType: null,
  });

  // Load tournaments
  useEffect(() => {
    async function fetchTournaments() {
      try {
        const res = await api.get("/api/tournaments");
        setTournaments(
          res.data.data.map((t) => ({
            value: t._id,
            label: t.name,
            games: t.games.map((g) => ({
              value: g.game._id,
              label: g.game.name,
              tournamentTeamType: g.tournamentTeamType,
            })),
          }))
        );
      } catch {
        toast.error("Failed to load tournaments");
      }
    }
    fetchTournaments();
  }, []);

  // Prefill form when `team` is passed
  useEffect(() => {
    if (team) {
      setForm({
        tournament: team.tournament
          ? { value: team.tournament._id, label: team.tournament.name }
          : null,
        game: team.game
          ? { value: team.game._id, label: team.game.name }
          : null,
        members: team.members.map((m) => m._id),
        tournamentTeamType: team.tournamentTeamType
          ? {
              value: team.tournamentTeamType,
              label:
                team.tournamentTeamType === "single_player"
                  ? "Single Player"
                  : "Double Player",
            }
          : null,
      });
    }
  }, [team]);

  // Load games when tournament changes
  useEffect(() => {
    if (form.tournament) {
      const selected = tournaments.find(
        (t) => t.value === form.tournament.value
      );
      setGames(selected?.games || []);
    }
  }, [form.tournament, tournaments]);

  // Load users when tournament+game selected
  useEffect(() => {
    async function fetchUsers() {
      if (!form.tournament || !form.game) return;
      try {
        const res = await api.get(
          `/api/tournaments/${form.tournament.value}/similar-players/unassigned-users?gameId=${form.game.value}`
        );
        setUsers(
          res.data.data.validUsers.map((u) => ({
            value: u._id,
            label: `${u.firstname} ${u.lastname} (${u.username})`,
          }))
        );
      } catch {
        toast.error("Failed to load members");
      }
    }
    fetchUsers();
  }, [form.tournament, form.game]);

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.tournament || !form.game || !form.tournamentTeamType) {
      toast.error("Tournament, game, and team type required");
      return;
    }

    if (
      form.tournamentTeamType.value === "double_player" &&
      form.members.length !== 2
    ) {
      toast.error("Exactly 2 members required");
      return;
    }

    if (
      form.tournamentTeamType.value === "single_player" &&
      form.members.length !== 1
    ) {
      toast.error("Exactly 1 member required");
      return;
    }

    try {
      const { data } = await api.patch(`/api/team/${team._id}`, {
        tournament: form.tournament.value,
        game: form.game.value,
        members: form.members,
      });

      toast.success(data.message || "Team updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--card-background)] p-6 rounded-xl w-[500px] max-w-full">
        <h2 className="text-xl font-bold mb-4">Edit Team</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <SearchableSelect
            label="Tournament"
            options={tournaments}
            value={form.tournament}
            onChange={(val) => setForm({ ...form, tournament: val })}
            placeholder="Select tournament"
          />

          <SearchableSelect
            label="Game"
            options={games}
            value={form.game}
            onChange={(val) => {
              setForm({
                ...form,
                game: val,
                tournamentTeamType: val
                  ? {
                      value: val.tournamentTeamType,
                      label:
                        val.tournamentTeamType === "single_player"
                          ? "Single Player"
                          : "Double Player",
                    }
                  : null,
              });
            }}
            placeholder="Select game"
          />

          <SearchableSelect
            label="Member 1"
            options={users}
            value={users.find((u) => u.value === form.members[0]) || null}
            onChange={(val) =>
              setForm({
                ...form,
                members: [val?.value || null, form.members[1] || null].filter(
                  Boolean
                ),
              })
            }
            placeholder="Select first member"
          />

          {console.log(form.tournamentTeamType)}

          {form.tournamentTeamType?.value === "double_player" && (
            <SearchableSelect
              label="Member 2"
              options={users}
              value={users.find((u) => u.value === form.members[1]) || null}
              onChange={(val) =>
                setForm({
                  ...form,
                  members: [form.members[0] || null, val?.value || null].filter(
                    Boolean
                  ),
                })
              }
              placeholder="Select second member"
            />
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--primary-color)] text-white rounded"
            >
              Update Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
