"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function ReceivedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // 🔎 Filter + search states
  const [selectedTournament, setSelectedTournament] = useState("all");
  const [selectedGame, setSelectedGame] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadRequests = async () => {
    try {
      const resUser = await api.get("/api/me");
      const id = resUser.data?.data?.user?._id;
      setUserId(id);

      const resRequests = await api.get("/api/teamup");
      setRequests(resRequests.data?.data?.requests || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateRequest = async (id, status) => {
    try {
      await api.patch(`/api/teamup/${id}`, { status });
      toast.success(status === "accepted" ? "Request accepted!" : "Request rejected");

      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status } : req))
      );
    } catch (err) {
      console.error(`❌ Failed to ${status}:`, err.response?.data || err);

      const isDuplicateKey = err.response?.data?.message?.includes("E11000 duplicate key");
      if (isDuplicateKey && status === "accepted") {
        toast.error("You are already team members");
        setRequests((prev) =>
          prev.map((req) =>
            req._id === id ? { ...req, status: "accepted" } : req
          )
        );
      } else {
        toast.error(err.response?.data?.message || `Failed to ${status} request`);
      }
    }
  };

  const formatDate = (isoString) => new Date(isoString).toLocaleString();

  if (loading) return <p className="p-6 text-center">Loading requests...</p>;

  // ✅ Only requests sent to current user
  const receivedRequests = requests.filter((r) => r.to?._id === userId);

  // ✅ Extract unique tournaments
  const tournaments = [
    ...new Set(
      receivedRequests.map(
        (r) =>
          r.fromTournament?.tournament?.name ||
          r.toTournament?.tournament?.name ||
          "Unknown"
      )
    ),
  ];

  // ✅ Extract unique games
  const games = [
    ...new Set(
      receivedRequests.flatMap((r) => {
        const g1 = r.fromTournament?.games || [];
        const g2 = r.toTournament?.games || [];
        return [...g1, ...g2].map((g) => g.name);
      })
    ),
  ];

  // ✅ Filters + search
  const filteredRequests = receivedRequests.filter((req) => {
    const tournamentName =
      req.fromTournament?.tournament?.name ||
      req.toTournament?.tournament?.name ||
      "Unknown";

    const allGames = [
      ...(req.fromTournament?.games || []),
      ...(req.toTournament?.games || []),
    ];
    const gameNames = allGames.map((g) => g.name);

    const matchesTournament =
      selectedTournament === "all" || selectedTournament === tournamentName;

    const matchesGame =
      selectedGame === "all" || gameNames.includes(selectedGame);

    const matchesSearch =
      req.from?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournamentName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTournament && matchesGame && matchesSearch;
  });

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-2xl font-bold mb-6">Received Team Up Requests</h1>

      {/* 🔎 Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Tournament Filter */}
        <select
          className="p-2 rounded bg-[var(--card-background)] border border-[var(--border-color)]"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
        >
          <option value="all">All Tournaments</option>
          {tournaments.map((t, i) => (
            <option key={i} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Game Filter */}
        <select
          className="p-2 rounded bg-[var(--card-background)] border border-[var(--border-color)]"
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
        >
          <option value="all">All Games</option>
          {games.map((g, i) => (
            <option key={i} value={g}>
              {g}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by username, message or tournament..."
          className="flex-1 p-2 rounded bg-[var(--card-background)] border border-[var(--border-color)]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredRequests.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((req) => {
            const tournamentName =
              req.fromTournament?.tournament?.name ||
              req.toTournament?.tournament?.name ||
              "Unknown";

            const allGames = [
              ...(req.fromTournament?.games || []),
              ...(req.toTournament?.games || []),
            ];

            return (
              <div
                key={req._id}
                className="p-5 rounded-2xl shadow-md transition hover:shadow-lg"
                style={{
                  background: "var(--card-background)",
                  border: `1px solid var(--border-color)`,
                }}
              >
                <h3 className="font-semibold text-lg mb-2 capitalize text-[var(--foreground)]">
                  {req.from?.firstname || req.from?.name} {req.from?.lastname || ""}
                </h3>
                <p className="text-sm mb-1">
                  <strong>Username: </strong>
                  {req.from?.username}
                </p>

                <p className="text-sm mb-1">
                  <strong>Tournament: </strong> {tournamentName}
                </p>

                {/* 🎮 Show games */}
                <div className="text-sm mb-2">
                  <strong>Games: </strong>
                  {allGames.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {allGames.map((g) => (
                        <li key={g._id} className="text-[var(--info-color)]">
                          {g.name} ({g.platform})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="opacity-70">No games</span>
                  )}
                </div>

                {req.status === "pending" && (
                  <p className="text-sm mb-2 italic">
                    {req.message || "wants to team up with you"}
                  </p>
                )}

                <p className="text-sm capitalize mb-1">
                  <span className="font-semibold">Status: </span>
                  {req.status}
                </p>

                {req.status === "pending" ? (
                  <div className="flex gap-2 mt-2">
                    <button
                      className="flex-1 py-2 px-4 rounded-lg font-semibold"
                      style={{
                        background: "var(--success-color)",
                        color: "white",
                      }}
                      onClick={() => updateRequest(req._id, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 py-2 px-4 rounded-lg font-semibold"
                      style={{ background: "var(--error-color)", color: "white" }}
                      onClick={() => updateRequest(req._id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <p
                    className={`text-sm font-medium mt-2 ${
                      req.status === "accepted"
                        ? "text-[var(--success-color)]"
                        : "text-[var(--error-color)]"
                    }`}
                  >
                    {req.status === "accepted"
                      ? "✅ You are now team members"
                      : "❌ Request rejected"}
                  </p>
                )}
                

                <p className="text-xs opacity-70 mt-3">
                  <strong>Received:</strong> {formatDate(req.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="opacity-70 text-sm">No requests found</p>
      )}
    </div>
  );
}
