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
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    tournament: null,
    game: null,
    members: [],
  });

  useEffect(() => {
    // ✅ Fetch tournament, games, and users for selects
    async function fetchData() {
      try {
        const [tRes, gRes, uRes] = await Promise.all([
          api.get("/api/tournaments"),
          api.get("/games"),
          api.get("/users"),
        ]);
        setTournaments(
          tRes.data.data.map((t) => ({ value: t._id, label: t.name }))
        );
        setGames(gRes.data.data.map((g) => ({ value: g._id, label: g.name })));
        setUsers(
          uRes.data.data.map((u) => ({
            value: u._id,
            label: `${u.firstname} ${u.lastname} (${u.username})`,
          }))
        );
      } catch (err) {
        toast.error("Failed to load options");
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tournament || !form.game || form.members.length !== 2) {
      toast.error("Tournament, game, and exactly 2 members are required");
      return;
    }

    try {
      await api.post("/teams", {
        tournament: form.tournament.value,
        game: form.game.value,
        members: form.members.map((m) => m.value),
      });
      toast.success("Team created successfully");
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
        placeholder="Select tournament..."
      />

      <SearchableSelect
        label="Game"
        options={games}
        value={form.game}
        onChange={(val) => setForm({ ...form, game: val })}
        placeholder="Select game..."
      />

      <SearchableSelect
        label="Member 1"
        options={users}
        value={form.members[0]}
        onChange={(val) =>
          setForm({ ...form, members: [val, form.members[1] || null] })
        }
        placeholder="Select first member..."
      />

      <SearchableSelect
        label="Member 2"
        options={users}
        value={form.members[1]}
        onChange={(val) =>
          setForm({ ...form, members: [form.members[0] || null, val] })
        }
        placeholder="Select second member..."
      />

      <button
        type="submit"
        className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white py-2 px-4 rounded-lg transition"
      >
        Create Team
      </button>
    </form>
  );
}
