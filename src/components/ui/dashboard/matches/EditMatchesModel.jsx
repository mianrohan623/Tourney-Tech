"use client";

import { useState, useEffect } from "react";


export default function EditMatchModal({ 
  isOpen, 
  onClose, 
  match, 
  teams = [], 
  onSave 
}) {
  const [form, setForm] = useState({
    teamA: "",
    teamAScore: "",
    teamAResult: "",
    teamB: "",
    teamBScore: "",
    teamBResult: "",
  });

  useEffect(() => {
    if (match) {
      setForm({
        teamA: match.teamA?.id || "",
        teamAScore: match.scoreA ?? "",
        teamAResult: match.resultA ?? "",
        teamB: match.teamB?.id || "",
        teamBScore: match.scoreB ?? "",
        teamBResult: match.resultB ?? "",
      });
    }
  }, [match]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(match?.id, form);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div
        className="w-full max-w-lg rounded-xl p-6"
        style={{ background: "var(--card-background)", border: "1px solid var(--border-color)" }}
      >
        <h2 className="text-lg font-semibold mb-4">
          Edit Match {match?.id ? `#${match.id}` : ""}
        </h2>

        <div className="space-y-6">
          {/* TEAM A */}
          <div>
            <h3 className="font-semibold mb-2">Team A</h3>
            <div className="space-y-2">
              <select
                value={form.teamA}
                onChange={(e) => handleChange("teamA", e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-[var(--border-color)] bg-[var(--card-background)] text-white"
              >
                <option value="">Select Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Score"
                value={form.teamAScore}
                onChange={(e) => handleChange("teamAScore", e.target.value)}
                className="w-full rounded-lg px-3 py-2 border bg-transparent"
                style={{ borderColor: "var(--border-color)", color: "var(--foreground)" }}
              />

              <select
                value={form.teamAResult}
                onChange={(e) => handleChange("teamAResult", e.target.value)}
                 className="w-full rounded-lg px-3 py-2 border border-[var(--border-color)] bg-[var(--card-background)] text-white"
              >
                <option value="">Select Result</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
              </select>
            </div>
          </div>

          {/* TEAM B */}
          <div>
            <h3 className="font-semibold mb-2">Team B</h3>
            <div className="space-y-2">
              <select
                value={form.teamB}
                onChange={(e) => handleChange("teamB", e.target.value)}
                className="w-full rounded-lg px-3 py-2 border border-[var(--border-color)] bg-[var(--card-background)] text-white"
              >
                <option value="">Select Team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Score"
                value={form.teamBScore}
                onChange={(e) => handleChange("teamBScore", e.target.value)}
                className="w-full rounded-lg px-3 py-2 border bg-transparent"
                style={{ borderColor: "var(--border-color)", color: "var(--foreground)" }}
              />


                
              <select
                value={form.teamBResult}
                onChange={(e) => handleChange("teamBResult", e.target.value)}
              className="w-full rounded-lg px-3 py-2 border border-[var(--border-color)] bg-[var(--card-background)] text-white"
              >
                <option value="">Select Result</option>
                <option value="win">Win</option>
                <option value="loss">Loss</option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg"
            style={{ background: "var(--secondary-color)", color: "var(--foreground)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg"
            style={{ background: "var(--accent-color)", color: "black" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
