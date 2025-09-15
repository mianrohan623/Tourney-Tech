"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function SentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Filters
  const [selectedTournament, setSelectedTournament] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Function to fetch user and requests
  const fetchRequests = async () => {
    try {
      const resUser = await api.get("/api/me");
      const id = resUser.data?.data?.user?._id;
      setUserId(id);

      const res = await api.get("/api/teamup");
      const data = res.data?.data;

      if (Array.isArray(data)) {
        setRequests(data);
      } else if (Array.isArray(data?.requests)) {
        setRequests(data.requests);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch requests:", err);
      toast.error("Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="p-6 text-center">Loading requests...</p>;

  // ✅ Sent requests
  const sentRequests = Array.isArray(requests)
    ? requests.filter((r) => r.from?._id === userId)
    : [];

  // ✅ Extract unique tournaments for filter dropdown
  const tournaments = [
    ...new Set(
      sentRequests.map(
        (r) => r.fromTournament?.name || r.toTournament?.name || "Unknown"
      )
    ),
  ];

  // ✅ Apply filters + search
  const filteredRequests = sentRequests.filter((req) => {
    const tournamentName =
      req.fromTournament?.name || req.toTournament?.name || "Unknown";

    const matchesTournament =
      selectedTournament === "all" || selectedTournament === tournamentName;

    const matchesSearch =
      req.to?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tournamentName?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTournament && matchesSearch;
  });

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-2xl font-bold mb-6">Sent Team Up Requests</h1>

      {/* 🔎 Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          className="p-2 rounded bg-[var(--card-background)] border"
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

        <input
          type="text"
          placeholder="Search by username, message or tournament..."
          className="flex-1 p-2 rounded bg-[var(--card-background)] border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredRequests.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((req) => (
            <div
              key={req._id}
              className="p-5 rounded-2xl shadow-md"
              style={{
                background: "var(--card-background)",
                border: `1px solid var(--border-color)`,
              }}
            >
              <h3 className="font-semibold text-lg mb-2 capitalize">
                {req.to?.firstname} {req.to?.lastname}
              </h3>

              <p className="text-sm mb-1">
                <strong>User Name: </strong>
                {req.to?.username}
              </p>

              {/* Tournament */}
              <p className="text-sm mb-1">
                <strong>Tournament: </strong>
                {req.fromTournament?.name ||
                  req.toTournament?.name ||
                  "Unknown"}
              </p>

              {/* Message */}
              <p className="text-sm mb-1">
                {req.status === "accepted"
                  ? "You are now team members"
                  : req.message || "Request sent"}
              </p>

              <p className="text-sm mb-1">
                <span className="font-semibold">Status: </span>
                <span className="capitalize">{req.status || "pending"}</span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="opacity-70 text-sm">No sent requests</p>
      )}
    </div>
  );
}
