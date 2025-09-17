"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axios";

export default function SittingForm({ onClose, onSuccess, editing }) {
  const [form, setForm] = useState({
    tournamentId: editing?.tournament?._id || "",
    gameId: editing?.game?._id || "", // ✅ real gameId
    image: editing?.image || null,
  });
  const [loading, setLoading] = useState(false);

  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);

  // Fetch all tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get("/api/tournaments");
        setTournaments(res.data.data || []);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
      }
    };
    fetchTournaments();
  }, []);

  // Update games when tournament changes
  useEffect(() => {
    if (form.tournamentId) {
      const selected = tournaments.find((t) => t._id === form.tournamentId);
      const gameList = selected?.games || [];
      setGames(gameList);

      // ✅ Check if current gameId exists in this tournament's games
      if (!gameList.find((g) => g.game?._id === form.gameId)) {
        setForm((prev) => ({ ...prev, gameId: "" }));
      }
    }
  }, [form.tournamentId, tournaments]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tournamentId", form.tournamentId);
      formData.append("gameId", form.gameId);

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      if (editing) {
        await api.patch(`/api/sitting-arrangment/${editing._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/sitting-arrangment", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div
        className="w-full max-w-md rounded-xl shadow-lg p-6"
        style={{ backgroundColor: "var(--card-background)", color: "var(--foreground)" }}
      >
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: "var(--primary-color)" }}
        >
          {editing ? "Edit Arrangement" : "Add Arrangement"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tournament Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Tournament</label>
            <select
              name="tournamentId"
              value={form.tournamentId}
              onChange={handleChange}
              className="w-full rounded-lg p-2 outline-none"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: "1px solid var(--border-color)",
                color: "var(--foreground)",
              }}
              required
            >
              <option value="">-- Select Tournament --</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Game Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Game</label>
            <select
              name="gameId"
              value={form.gameId}
              onChange={handleChange}
              className="w-full rounded-lg p-2 outline-none"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: "1px solid var(--border-color)",
                color: "var(--foreground)",
              }}
              required
              disabled={!form.tournamentId}
            >
              <option value="">-- Select Game --</option>
              {games.map((g) => (
                <option key={g._id} value={g.game?._id}>
                  {g.game?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full rounded-lg p-2"
              style={{
                backgroundColor: "var(--secondary-color)",
                border: "1px solid var(--border-color)",
                color: "var(--foreground)",
              }}
            />

            {form.image instanceof File ? (
              <img
                src={URL.createObjectURL(form.image)}
                alt="Preview"
                className="mt-2 w-24 h-24 rounded object-cover"
                style={{ border: "1px solid var(--border-color)" }}
              />
            ) : (
              form.image && (
                <img
                  src={form.image}
                  alt="Current"
                  className="mt-2 w-24 h-24 rounded object-cover"
                  style={{ border: "1px solid var(--border-color)" }}
                />
              )
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg"
              style={{
                border: "1px solid var(--border-color)",
                backgroundColor: "transparent",
                color: "var(--foreground)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg text-white disabled:opacity-50"
              style={{
                backgroundColor: "var(--primary-color)",
              }}
            >
              {loading ? "Saving..." : editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
