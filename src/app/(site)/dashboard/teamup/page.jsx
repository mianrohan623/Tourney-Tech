"use client";
import { useState, useEffect } from "react";
import api from "@/utils/axios"; // axios instance with auth headers
import { toast } from "react-hot-toast";

export default function TeamUp() {
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch matched users from your API
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        console.log("🔎 Fetching similar players...");
        const res = await api.get("/api/tournaments/similar-players");

        console.log("✅ API Response:", res.data);

        const matchedUsers = res.data?.data?.matchedUsers || [];

        // ✅ Use correct keys (firstname / lastname)
        const formatted = matchedUsers.map((u) => ({
          id: u._id,
          firstname: u.firstname || "",
          lastname: u.lastname || "",
          username: u.username || "",
          city: u.city || "Unknown",
          country: u.country || "Unknown",
          gender: u.gender || "Not specified",
          email: u.email || "",
          phone: u.phone || "",
          role: u.role || "",
          status: u.status || "",
          requested: false,
        }));

        setPlayers(formatted);
      } catch (err) {
        console.error("❌ Failed to fetch players:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // ✅ Send request to backend
  const handleRequest = async (id) => {
    try {
      await api.post("/api/teamup", { to: id }); // your API expects { to }
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, requested: true } : p))
      );
      toast.success("Team-up request sent!");
    } catch (err) {
      console.error("❌ Failed to send request:", err);
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  // ✅ Cancel request (optional, backend support needed if you want real cancel)
  const handleCancel = (id) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, requested: false } : p))
    );
    toast("Request cancelled (local only)");
  };

  const filteredPlayers = players.filter((p) =>
    `${p.firstname} ${p.lastname} ${p.username} ${p.gender}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-2xl font-bold mb-6">Team Up</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg px-4 py-2"
          style={{
            background: "var(--secondary-color)",
            border: `1px solid var(--border-color)`,
            color: "var(--foreground)",
          }}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-center">Loading players...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <div
                key={player.id}
                className="p-5 rounded-2xl shadow-md transition hover:shadow-lg"
                style={{
                  background: "var(--card-background)",
                  border: `1px solid var(--border-color)`,
                }}
              >
                <h2 className="text-lg font-semibold mb-2 capitalize">
                  {player.firstname} {player.lastname}
                </h2>
                <p className="text-sm">
                  <span className="font-semibold">Username:</span>{" "}
                  {player.username}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Location:</span>{" "}
                  {player.city}, {player.country}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Gender:</span>{" "}
                  {player.gender}
                </p>

                {!player.requested ? (
                  <button
                    type="button"
                    className="mt-4 w-full font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                    style={{
                      background: "var(--accent-color)",
                      color: "black",
                    }}
                    onClick={() => handleRequest(player.id)}
                  >
                    Send Request
                  </button>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 font-semibold py-2 px-4 rounded-lg shadow-md cursor-default"
                      style={{
                        background: "var(--success-color)",
                        color: "white",
                      }}
                    >
                      Requested
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg shadow-md font-semibold transition duration-200"
                      style={{
                        background: "var(--error-color)",
                        color: "white",
                      }}
                      onClick={() => handleCancel(player.id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-sm opacity-75">
              No players found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
