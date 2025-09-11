"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function TeamCreator() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch all registered users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/api/tournaments/similar-players"); // adjust endpoint if needed
        const allUsers = res.data?.data?.matchedUsers || [];
        setUsers(allUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      `${u.firstname} ${u.lastname} ${u.username}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const toggleSelect = (user) => {
    if (selectedMembers.some((m) => m._id === user._id)) {
      setSelectedMembers((prev) =>
        prev.filter((m) => m._id !== user._id)
      );
    } else {
      if (selectedMembers.length < 2) {
        setSelectedMembers((prev) => [...prev, user]);
      } else {
        toast.info("You can only select 2 members");
      }
    }
  };

  const createTeam = async () => {
    if (!teamName.trim()) return toast.error("Team name is required");
    if (selectedMembers.length !== 2)
      return toast.error("Select exactly 2 members");

    try {
      setCreating(true);
      const members = selectedMembers.map((m) => m._id);
      const payload = { name: teamName, members, tournament: "tournamentId", game: "gameId" }; 
      // replace tournament/game with actual ids or state
      const res = await api.post("/api/team", payload);
      toast.success(res.data?.message || "Team created successfully");

      // Reset form
      setTeamName("");
      setSelectedMembers([]);
    } catch (err) {
      console.error("Failed to create team:", err);
      toast.error(err.response?.data?.message || "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading users...</p>;

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <h1 className="text-2xl font-bold mb-6">Create Team</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg"
          style={{
            background: "var(--secondary-color)",
            border: `1px solid var(--border-color)`,
            color: "var(--foreground)",
          }}
        />
        <button
          onClick={createTeam}
          disabled={creating || selectedMembers.length !== 2 || !teamName.trim()}
          className="px-6 py-2 rounded-lg font-semibold transition"
          style={{
            background: selectedMembers.length === 2 && teamName.trim() ? "var(--accent-color)" : "var(--border-color)",
            color: "black",
          }}
        >
          {creating ? "Creating..." : "Create Team"}
        </button>
      </div>

      <input
        type="text"
        placeholder="Search players..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 rounded-lg"
        style={{
          background: "var(--secondary-color)",
          border: `1px solid var(--border-color)`,
          color: "var(--foreground)",
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const isSelected = selectedMembers.some((m) => m._id === user._id);
            return (
              <div
                key={user._id}
                onClick={() => toggleSelect(user)}
                className={`p-5 rounded-2xl shadow-md cursor-pointer transition hover:shadow-lg`}
                style={{
                  background: isSelected ? "var(--accent-color)" : "var(--card-background)",
                  border: `1px solid var(--border-color)`,
                  color: isSelected ? "black" : "var(--foreground)",
                }}
              >
                <h2 className="text-lg font-semibold mb-2 capitalize">
                  {user.firstname} {user.lastname}
                </h2>
                <p className="text-sm">
                  <span className="font-semibold">Username:</span> {user.username}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Location:</span> {user.city}, {user.country}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Gender:</span> {user.gender}
                </p>
              </div>
            );
          })
        ) : (
          <p className="col-span-full text-center text-sm opacity-75">No users found.</p>
        )}
      </div>
    </div>
  );
}
