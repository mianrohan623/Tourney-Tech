"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

import PartnerTournaments from "@/components/ui/dashboard/team/PartnerTournament";

export default function SelectTeam() {
  const [requests, setRequests] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [selectedGameId, setSelectedGameId] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [partner, setPartner] = useState(null);
  const [partnerId, setPartnerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingRequests, setFetchingRequests] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ✅ Fetch current user
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

  // ✅ Fetch requests
  useEffect(() => {
    if (!currentUserId) return;

    const fetchRequests = async () => {
      try {
        setFetchingRequests(true);
        const res = await api.get("/api/teamup");
        const allRequests = res.data.data?.requests || [];

        // only keep requests where currentUser is in from or to
        const myRequests = allRequests.filter(
          (r) => r.from?._id === currentUserId || r.to?._id === currentUserId
        );
        setRequests(myRequests);

        // ✅ extract unique tournaments (with games)
        const tournamentList = Array.from(
          new Map(
            myRequests
              .filter((r) => r.tournament)
              .map((r) => [
                r.tournament._id,
                {
                  _id: r.tournament._id,
                  name: r.tournament.name,
                  games: r.games || [], // each request may include games
                },
              ])
          ).values()
        );

        setTournaments(tournamentList);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load requests");
      } finally {
        setFetchingRequests(false);
      }
    };

    fetchRequests();
  }, [currentUserId]);

  // ✅ Default tournament & game
  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournamentId) {
      const first = tournaments[0];
      setSelectedTournamentId(first._id);
      if (first.games?.length > 0) {
        setSelectedGameId(first.games[0]._id);
      }
    }
  }, [tournaments, selectedTournamentId]);

  // ✅ Reset game & request when tournament changes
  useEffect(() => {
    const selectedTournament = tournaments.find(
      (t) => t._id === selectedTournamentId
    );
    if (selectedTournament) {
      if (selectedTournament.games?.length > 0) {
        setSelectedGameId(selectedTournament.games[0]._id);
      } else {
        setSelectedGameId("");
      }
    }
    setSelectedRequestId("");
  }, [selectedTournamentId, tournaments]);

  // ✅ Filter requests by selected tournament & game
  const filteredRequests = requests.filter(
    (r) =>
      r.tournament?._id === selectedTournamentId &&
      (!selectedGameId || r.games?.some((g) => g._id === selectedGameId))
  );

  console.log("filteredRequests===================", filteredRequests);

  // ✅ Default request when filteredRequests change
  useEffect(() => {
    if (filteredRequests.length > 0 && !selectedRequestId) {
      setSelectedRequestId(filteredRequests[0]._id);
    }
  }, [filteredRequests, selectedRequestId]);

  // ✅ Update partner when request changes
  useEffect(() => {
    const req = requests.find((r) => r._id === selectedRequestId);
    if (req) {
      const partnerUser = req.from?._id === currentUserId ? req.to : req.from;
      setPartner(partnerUser || null);
      setPartnerId(partnerUser?._id || "");
    } else {
      setPartner(null);
      setPartnerId("");
    }
  }, [selectedRequestId, requests, currentUserId]);

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequestId) return toast.error("Please select a team request");
    if (!partnerId) return toast.error("No partner found");

    try {
      setLoading(true);

      const selectedMembersObj = filteredRequests?.find(
        (r) => r._id === selectedRequestId
      );

      const selectedMembers = [
        selectedMembersObj?.from?._id,
        selectedMembersObj?.to?._id,
      ];
      // ✅ backend expects: teamId + partnerId
      const formData = new FormData();
      formData.append("memberIds", selectedMembers); // send requestId as teamId
      formData.append("partnerId", partnerId);
      formData.append("tournamentId", selectedTournamentId); // send requestId as teamId
      formData.append("gameId", selectedGameId);
      formData.append(
        "teamName",
        `${selectedMembersObj?.from?.firstName}_${selectedMembersObj?.to?.firstName}`
      );

      await api.post("/api/team/select-partner", formData, {
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

  console.log(
    "selectedRequestId=========",
    filteredRequests?.find((r) => r._id === selectedRequestId)
  );

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

        {fetchingRequests ? (
          <p style={{ color: "var(--foreground)" }}>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p style={{ color: "var(--foreground)" }}>No requests found</p>
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
                className="w-full p-2 rounded-lg border-[var(--border-color)] bg-[var(--card-background)] text-[var(--foreground)] border focus:outline-none"
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

            {/* Game select */}
            {tournaments.find((t) => t._id === selectedTournamentId)?.games
              ?.length > 0 && (
              <div>
                <label
                  className="block text-sm mb-2"
                  style={{ color: "var(--foreground)" }}
                >
                  Choose Game
                </label>
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full p-2 rounded-lg border-[var(--border-color)] bg-[var(--card-background)] text-[var(--foreground)] border focus:outline-none"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--foreground)",
                  }}
                >
                  {tournaments
                    .find((t) => t._id === selectedTournamentId)
                    ?.games.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Team (Request) select */}
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Choose Team (Request)
              </label>
              <select
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                className="w-full p-2 rounded-lg border-[var(--border-color)] bg-[var(--card-background)] text-[var(--foreground)] border focus:outline-none"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
              >
                {filteredRequests.map((r) => (
                  <option key={r._id} value={r._id}>
                    {`${r.from?.firstname || r.from?.username} & ${
                      r.to?.firstname || r.to?.username
                    }`}
                  </option>
                ))}
              </select>
            </div>

            {/* Partner (auto-selected, read-only) */}
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--foreground)" }}
              >
                Partner
              </label>
              <input
                type="text"
                value={
                  partner?.username ||
                  partner?.firstname ||
                  partner?.email ||
                  ""
                }
                disabled
                className="w-full p-2 rounded-lg bg-transparent border cursor-not-allowed"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
              />
            </div>

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
