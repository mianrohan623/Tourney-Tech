"use client";
import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function ReceivedRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Function to fetch requests and user
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

  // Polling every 5 seconds to get new requests automatically
  useEffect(() => {
    loadRequests(); // initial load
    const interval = setInterval(loadRequests, 5000); // fetch every 5s
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  // Approve / reject request
  const updateRequest = async (id, status) => {
    try {
      await api.patch(`/api/teamup/${id}`, { status });

      toast.success(
        status === "accepted" ? "Request accepted!" : "Request rejected"
      );

      // Update request status locally immediately
      setRequests((prev) =>
        prev.map((req) => (req._id === id ? { ...req, status } : req))
      );
    } catch (err) {
      console.error(`❌ Failed to ${status}:`, err.response?.data || err);

      // Only show message for duplicate key error
      const isDuplicateKey = err.response?.data?.message?.includes(
        "E11000 duplicate key"
      );
      if (isDuplicateKey && status === "accepted") {
        toast.error("You are already team members");
        setRequests((prev) =>
          prev.map((req) =>
            req._id === id ? { ...req, status: "accepted" } : req
          )
        );
      } else {
        toast.error(
          err.response?.data?.message || `Failed to ${status} request`
        );
      }
    }
  };

  if (loading) return <p className="p-6 text-center">Loading requests...</p>;

  // Filter only requests received by current user
  const receivedRequests = requests.filter((r) => r.to?._id === userId);

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-2xl font-bold mb-6">Received Team Up Requests</h1>

      {receivedRequests.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {receivedRequests.map((req) => (
            <div
              key={req._id}
              className="p-5 rounded-2xl shadow-md"
              style={{
                background: "var(--card-background)",
                border: `1px solid var(--border-color)`,
              }}
            >
              <h3 className="font-semibold text-lg mb-2">
                {req.from?.firstname || req.from?.name}{" "}
                {req.from?.lastname || ""} 
              </h3>
              <p className="text-sm">
                <strong>User Name: </strong>
                {req.to?.username}
              </p>
              {/* Show message only if pending */}
              {req.status === "pending" && (
                <p className="text-sm mb-2">
                  {req.message || "wants to team up with you"}
                </p>
              )}

              <p className="text-sm font-semibold capitalize mb-2">
                Status: {req.status}
              </p>

              {req.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-semibold cursor-pointer"
                    style={{
                      background: "var(--success-color)",
                      color: "white",
                    }}
                    onClick={() => updateRequest(req._id, "accepted")}
                  >
                    Accept
                  </button>
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-semibold cursor-pointer"
                    style={{ background: "var(--error-color)", color: "white" }}
                    onClick={() => updateRequest(req._id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <p className="text-sm font-medium text-green-600">
                  {req.status === "accepted"
                    ? "You are now team members"
                    : "Request rejected"}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="opacity-70 text-sm">No requests found</p>
      )}
    </div>
  );
}
