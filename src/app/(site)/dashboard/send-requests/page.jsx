"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function SentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Function to fetch user and requests
  const fetchRequests = async () => {
    try {
      const resUser = await api.get("/api/me");
      const id = resUser.data?.data?.user?._id;
      setUserId(id);

      const res = await api.get("/api/teamup");
      setRequests(res.data?.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch requests:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + polling every 5 seconds
  useEffect(() => {
    fetchRequests(); // initial load
    const interval = setInterval(fetchRequests, 5000); // fetch every 5s
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  if (loading) return <p className="p-6 text-center">Loading requests...</p>;

  // Filter only requests sent by current user
  const sentRequests = requests.filter((r) => r.from?._id === userId);

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <h1 className="text-2xl font-bold mb-6">Sent Team Up Requests</h1>

      {sentRequests.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sentRequests.map((req) => (
            <div
              key={req._id}
              className="p-5 rounded-2xl shadow-md"
              style={{ background: "var(--card-background)", border: `1px solid var(--border-color)` }}
            >
              <h3 className="font-semibold text-lg mb-2">
                {req.to?.firstname} {req.to?.lastname} ({req.to?.email})
              </h3>
              <p className="text-sm">
                {req.status === "accepted"
                  ? "You are now team members"
                  : "wants to team up with you"}
              </p>
              <p className="text-sm">
                Status: <span className="font-semibold capitalize">{req.status || "pending"}</span>
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
