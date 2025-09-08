"use client";
import { useState } from "react";

export default function Notifications() {
  const [requests, setRequests] = useState([
    { id: 1, name: "Test User", game: "PUBG", status: "pending" },
    { id: 2, name: "Rohan", game: "COD", status: "pending" },
    { id: 3, name: "Ali", game: "Valorant", status: "pending" },
  ]);

  const handleAccept = (id) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "friends" } : r
      )
    );
  };

  const handleCancel = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl shadow-md flex justify-between items-center"
              style={{
                background: "var(--card-background)",
                border: `1px solid var(--border-color)`,
              }}
            >
              {/* Request Info */}
              <div>
                <h2 className="text-lg font-semibold">{req.name}</h2>
                <p className="text-sm opacity-80">
                  Wants to team up in {req.game}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                {req.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg font-semibold shadow-md transition"
                      style={{
                        background: "var(--success-color)",
                        color: "white",
                      }}
                      onClick={() => handleAccept(req.id)}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg font-semibold shadow-md transition"
                      style={{
                        background: "var(--error-color)",
                        color: "white",
                      }}
                      onClick={() => handleCancel(req.id)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-lg font-semibold shadow-md cursor-default"
                    style={{
                      background: "var(--success-color)",
                      color: "white",
                    }}
                  >
                    Friends
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center opacity-75">No new friend requests.</p>
      )}
    </div>
  );
}
