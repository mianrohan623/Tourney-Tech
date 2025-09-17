"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

import PartnerTournaments from "@/components/ui/dashboard/team/PartnerTournament";

export default function SelectTeam() {
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [members, setMembers] = useState([]);
  const [partnerId, setPartnerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingTeams, setFetchingTeams] = useState(true);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/api/me");
        const userId = res?.data?.data?.user?._id;
        if (!userId) throw new Error("No user ID found");
        setCurrentUserId(userId);
      } catch (err) {
        console.error(err);
        toast.error("Failed to get current user");
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch all teams
  useEffect(() => {
    const fetchTeams = async () => {
      if (!currentUserId) return;

      try {
        setFetchingTeams(true);
        const res = await api.get("/api/teamup");
        const allTeams = res.data.data?.teams || [];
        // Only teams created by current user
        const myTeams = allTeams.filter(
          (team) => team.createdBy?._id === currentUserId
        );
        setTeams(myTeams);

        // Extract tournaments from teams (filter out null)
        const tournamentList = myTeams
          .map((t) => t.tournament)
          .filter(Boolean) // remove null
          .map((t) => ({ _id: t._id, name: t.name }));
        setTournaments(tournamentList);

        // Select first tournament & team if exists
        if (tournamentList.length > 0)
          setSelectedTournamentId(tournamentList[0]._id);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load your teams");
      } finally {
        setFetchingTeams(false);
      }
    };

    fetchTeams();
  }, [currentUserId]);

  // Filter teams by selected tournament
  const filteredTeams = selectedTournamentId
    ? teams.filter((team) => team.tournament?._id === selectedTournamentId)
    : [];

  // Select first team when tournament changes
  useEffect(() => {
    setSelectedTeamId(filteredTeams[0]?._id || "");
  }, [selectedTournamentId, filteredTeams]);

  // Fetch members of selected team
  useEffect(() => {
    if (!selectedTeamId) return;

    setFetchingMembers(true);
    const team = teams.find((t) => t._id === selectedTeamId);
    if (!team || !team.members) {
      setMembers([]);
      setFetchingMembers(false);
      return;
    }

    const otherMembers = team.members.filter((m) => m._id !== currentUserId);
    setMembers(otherMembers);
    setPartnerId(otherMembers[0]?._id || "");
    setFetchingMembers(false);
  }, [selectedTeamId, teams, currentUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) return toast.error("Please select a team");
    if (!partnerId) return toast.error("Please select a partner");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("teamId", selectedTeamId);
      formData.append("partnerId", partnerId);

      await api.patch("/api/team/select-partner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Partner selected successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to select partner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="w-full p-6 rounded-2xl shadow-lg"
        style={{
          background: "var(--card-background)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: "var(--accent-color)" }}
        >
          Select Team Partner
        </h2>

        {fetchingTeams ? (
          <p style={{ color: "var(--foreground)" }}>Loading your teams...</p>
        ) : teams.length === 0 ? (
          <p style={{ color: "var(--foreground)" }}>You are already in one team</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tournament select */}
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Choose Tournament
              </label>
              <select
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="w-full p-2 rounded-lg bg-transparent border focus:outline-none"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
              >
                {tournaments.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Team select */}
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Choose Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full p-2 rounded-lg bg-transparent border focus:outline-none"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
              >
                {filteredTeams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Partner select */}
            {fetchingMembers ? (
              <p style={{ color: "var(--foreground)" }}>Loading members...</p>
            ) : members.length === 0 ? (
              <p style={{ color: "var(--foreground)" }}>
                No other members in this team
              </p>
            ) : (
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Choose a partner
                </label>
                <select
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="w-full p-2 rounded-lg bg-transparent border focus:outline-none"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--foreground)",
                  }}
                >
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.username || m.firstname || m.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg font-semibold transition"
              style={{
                background: "var(--primary-color)",
                color: "var(--foreground)",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Saving..." : "Confirm Partner"}
            </button>
          </form>
        )}
      </div>

      <PartnerTournaments />
    </>
  );
}
