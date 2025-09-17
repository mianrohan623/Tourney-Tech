"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function EditMatchModal({ isOpen, onClose, match, onSave }) {
  const [form, setForm] = useState({
    teamAScore: "",
    teamBScore: "",
    winner: "", // store winner teamId
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (match) {
      setForm({
        teamAScore: match.teamAScore ?? 0,
        teamBScore: match.teamBScore ?? 0,
        winner: match.winner?._id || "", // default winner if exists
      });
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

 const handleSave = async () => {
  setSaving(true);
  try {
    const winnerId = form.winner;
    let loserId = null;

    if (winnerId === match.teamA._id) loserId = match.teamB._id;
    else if (winnerId === match.teamB._id) loserId = match.teamA._id;

    const payload = {
      matchNumber: match.matchNumber,  // <-- required by backend
      teamAScore: Number(form.teamAScore),
      teamBScore: Number(form.teamBScore),
      teamAtotalWon: Number(form.teamAScore) > Number(form.teamBScore) ? 1 : 0,
      teamBtotalWon: Number(form.teamBScore) > Number(form.teamAScore) ? 1 : 0,
      winner: winnerId || null,
      loser: loserId,
    };

    const res = await api.patch(`/api/matches/${match._id}`, payload);
    toast.success(res.data.message || "Match updated successfully");

    if (onSave) onSave(match._id, res.data.data);
    onClose();
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Failed to update match");
  } finally {
    setSaving(false);
  }
};



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div
        className="w-full max-w-lg rounded-xl p-6"
        style={{
          background: "var(--card-background)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2 className="text-lg font-semibold mb-4">
          Edit Match #{match.matchNumber}
        </h2>

        <div className="space-y-6">
          {/* TEAM A */}
          <div>
            <h3 className="font-semibold mb-2">{match.teamA.name}</h3>
            <input
              type="number"
              placeholder="Score"
              value={form.teamAScore}
              onChange={(e) => handleChange("teamAScore", e.target.value)}
              className="w-full rounded-lg px-3 py-2 border bg-transparent"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
            />
          </div> 

          {/* TEAM B */}
          <div>
            <h3 className="font-semibold mb-2">{match.teamB.name}</h3>
            <input
              type="number"
              placeholder="Score"
              value={form.teamBScore}
              onChange={(e) => handleChange("teamBScore", e.target.value)}
              className="w-full rounded-lg px-3 py-2 border bg-transparent"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
            />
          
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg"
            style={{
              background: "var(--secondary-color)",
              color: "var(--foreground)",
            }}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg"
            style={{ background: "var(--accent-color)", color: "black" }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
