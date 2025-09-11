"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function ReceivedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Fetch current user and requests
  useEffect(() => {
    const load = async () => {
      try {
        // 1️⃣ Get current user
        const resUser = await api.get("/api/me");
        const id = resUser.data?.data?.user?._id;
        setUserId(id);

        // 2️⃣ Fetch team-up requests
        const resRequests = await api.get("/api/teamup");
        setRequests(resRequests.data?.data || []);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Approve / reject request
  const updateRequest = async (id, status) => {
    try {
      const formData = new FormData();
      formData.append("status", status);

      await api.patch(`/api/teamup/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(status === "accepted" ? "Request accepted!" : "Request rejected");

      // Refresh requests
      const res = await api.get("/api/teamup");
      setRequests(res.data?.data || []);
    } catch (err) {
      console.error(`❌ Failed to ${status}:`, err.response?.data || err);
      toast.error(`Failed to ${status} request`);
    }
  };

  if (loading) return <p className="p-6 text-center">Loading requests...</p>;

  // Show only received requests
  const receivedRequests = requests.filter(
    r => r.to?._id?.toString() === userId
  );

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <h1 className="text-2xl font-bold mb-6">Received Team Up Requests</h1>

      {receivedRequests.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {receivedRequests.map(req => (
            <div
              key={req._id}
              className="p-5 rounded-2xl shadow-md"
              style={{ background: "var(--card-background)", border: `1px solid var(--border-color)` }}
            >
              <h3 className="font-semibold text-lg mb-2">
                {req.from?.firstname || req.from?.name} {req.from?.lastname || ""} ({req.from?.email})
              </h3>
              <p className="text-sm mb-4">{req.message || "wants to team up with you"}</p>

              {req.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-semibold"
                    style={{ background: "var(--success-color)", color: "white" }}
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
                <p className="text-sm font-semibold capitalize">Status: {req.status}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="opacity-70 text-sm">No received requests</p>
      )}
    </div>
  );
}
