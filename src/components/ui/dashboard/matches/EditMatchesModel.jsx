"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function EditMatchModal({ isOpen, onClose, match, onSave }) {
  const [form, setForm] = useState({
    teamAScore: "",
    teamBScore: "",
    teamAtotalWon: 0,
    teamBtotalWon: 0,
    teamAboston: 0,
    teamBboston: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (match) {
      setForm({
        teamAScore: match.teamAScore ?? 0,
        teamBScore: match.teamBScore ?? 0,
        teamAtotalWon: match.teamAtotalWon ?? 0,
        teamBtotalWon: match.teamBtotalWon ?? 0,
        teamAboston: match.teamAboston ?? 0,
        teamBboston: match.teamBboston ?? 0,
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
      const payload = {
        matchNumber: match.matchNumber,
        teamAScore: Number(form.teamAScore),
        teamBScore: Number(form.teamBScore),
        teamAtotalWon: Number(form.teamAtotalWon),
        teamBtotalWon: Number(form.teamBtotalWon),
        teamAboston: Number(form.teamAboston),
        teamBboston: Number(form.teamBboston),
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
            <h3 className="font-semibold mb-2">
              {match.teamA.serialNo} {match.teamA.name}
            </h3>

            {/* Score */}
            <input
              type="number"
              placeholder="Score"
              value={form.teamAScore}
              onChange={(e) => handleChange("teamAScore", e.target.value)}
              className="w-full rounded-lg px-3 py-2 border bg-transparent mb-2"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
            />

            {/* Total Hands Won (0–10) */}
            <select
              value={form.teamAtotalWon}
              onChange={(e) => handleChange("teamAtotalWon", e.target.value)}
              className="w-full rounded-lg px-3 py-2 border bg-[var(--card-background)] mb-2"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
            >
              {[...Array(11).keys()].map((n) => (
                <option key={n} value={n}>
                  Hands Won: {n}
                </option>
              ))}
            </select>

            {/* Boston (0–10) */}
            <select
              value={form.teamAboston}
              onChange={(e) => handleChange("teamAboston", e.target.value)}
              className="w-full rounded-lg px-3 py-2 border bg-[var(--card-background)]"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
            >
              {[...Array(11).keys()].map((n) => (
                <option key={n} value={n}>
                  Boston: {n}
                </option>
              ))}
            </select>
          </div>

          {/* TEAM B */}
          <div>
            <h3 className="font-semibold mb-2">
              {match.teamB.serialNo} {match.teamB.name}
            </h3>

            {/* Score */}
            <input
              type="number"
              placeholder="Score"
              value={form.teamBScore}
              onChange={(e) => handleChange("teamBScore", e.target.value)}
              className="w-full rounded-lg px-3 py-2 border bg-transparent mb-2"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
            />

            {/* Total Hands Won (0–10) */}
            <select
              value={form.teamBtotalWon}
              onChange={(e) => handleChange("teamBtotalWon", e.target.value)}
              className="w-full rounded-lg px-3 py-2 border bg-[var(--card-background)] mb-2"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
            >
              {[...Array(11).keys()].map((n) => (
                <option key={n} value={n}>
                  Hands Won: {n}
                </option>
              ))}
            </select>

            {/* Boston (0–10) */}
            <select
              value={form.teamBboston}
              onChange={(e) => handleChange("teamBboston", e.target.value)}
              className="w-full rounded-lg px-3 py-2 border bg-[var(--card-background)]"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
            >
              {[...Array(11).keys()].map((n) => (
                <option key={n} value={n}>
                  Boston: {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ACTION BUTTONS */}
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
