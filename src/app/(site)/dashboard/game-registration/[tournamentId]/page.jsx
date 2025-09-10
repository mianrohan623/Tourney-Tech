"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";

export default function GameRegistrationPage() {
  const params = useParams();
  const tournamentId = params?.tournamentId;

  const [games, setGames] = useState([]);
  const [tournamentGames, setTournamentGames] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [formData, setFormData] = useState({
    game: "",
    paymentType: "",
    bankAccount: "",
    transactionId: "",
    accountName: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!tournamentId) return;

    async function fetchData() {
      try {
        const res = await api.get(`/api/tournaments/${tournamentId}`);
        const fetchBankDetails = await api.get("/api/bankDetails");
        console.log("Response:", res.data);
        const registrationData = res.data;

        // Registered games for dropdown
        const registeredGames = registrationData?.games || [];
        setGames(
          registeredGames.map((g) => ({
            _id: g?.game?._id,
            name: g?.game?.name,
          }))
        );

        // Tournament game details
        const tournamentGamesData = registrationData?.games || [];
        setTournamentGames(
          tournamentGamesData.map((g) => ({
            _id: g.game?._id, // ✅ use the game ID string
            entryFee: g.entryFee,
            format: g.format,
            teamBased: g.teamBased,
            minPlayers: g.minPlayers,
            maxPlayers: g.maxPlayers,
          }))
        );

        // Bank accounts (array of objects)
        const bankObj = fetchBankDetails?.data?.data || [];
        setBankAccounts(bankObj ? bankObj : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load games or bank accounts.");
      } finally {
        setFetching(false);
      }
    }

    fetchData();
  }, [tournamentId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tournamentId) return toast.error("Tournament ID is required!");

    try {
      setLoading(true);

      const payload = {
        tournamentId,
        gameIds: formData.game,
        paymentMethod: formData.paymentType,
      };

      if (formData.paymentType === "online") {
        payload.paymentDetails = {
          bankId: formData.bankAccount,
          accountName: formData.accountName,
          transactionId: formData.transactionId,
        };
      }

      console.log("Payload:", payload); // <-- check what is being sent

      const res = await api.post("/api/tournamentRegister", payload, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Registration successful!");
      console.log("Response:", res.data);

      setFormData({
        game: "",
        paymentType: "",
        bankAccount: "",
        transactionId: "",
        accountName: "",
      });
    } catch (err) {
      console.error("Error submitting registration:", err);
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const selectedGameDetails = tournamentGames.find(
    (g) => g._id === formData.game
  );
  const selectedBank = bankAccounts.find((b) => b._id === formData.bankAccount);

  if (fetching) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div
      className="max-w-lg mx-auto rounded-2xl p-8 shadow-lg border"
      style={{
        background: "var(--card-background)",
        borderColor: "var(--border-color)",
      }}
    >
      <h2
        className="text-2xl font-bold text-center mb-6"
        style={{ color: "var(--accent-color)" }}
      >
        Tournament Registration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Game Selection */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Select Game
          </label>
          <select
            name="game"
            value={formData.game}
            onChange={handleChange}
            required
            className="w-full rounded-lg px-3 py-2"
            style={{
              background: "var(--secondary-color)",
              borderColor: "var(--border-color)",
              color: "var(--foreground)",
            }}
          >
            <option value="">-- Select Game --</option>
            {games.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          {selectedGameDetails && (
            <div
              className="mt-3 p-3 border rounded-lg"
              style={{
                background: "var(--secondary-color)",
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
            >
              <p>
                <strong>Entry Fee:</strong> {selectedGameDetails.entryFee} PKR
              </p>
              <p>
                <strong>Format:</strong> {selectedGameDetails.format}
              </p>
              <p>
                <strong>Team Based:</strong>{" "}
                {selectedGameDetails.teamBased ? "Yes" : "No"}
              </p>
              <p>
                <strong>Min Players:</strong> {selectedGameDetails.minPlayers}
              </p>
              <p>
                <strong>Max Players:</strong> {selectedGameDetails.maxPlayers}
              </p>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--foreground)" }}
          >
            Payment Method
          </label>
          <select
            name="paymentType"
            value={formData.paymentType}
            onChange={handleChange}
            required
            className="w-full rounded-lg px-3 py-2"
            style={{
              background: "var(--secondary-color)",
              borderColor: "var(--border-color)",
              color: "var(--foreground)",
            }}
          >
            <option value="">-- Select Payment Type --</option>
            <option value="online">Online</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        {formData.paymentType === "online" && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Select Bank Account
              </label>
              <select
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                required
                className="w-full rounded-lg px-3 py-2"
                style={{
                  background: "var(--secondary-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
              >
                <option value="">-- Select Bank Account --</option>
                {bankAccounts.map((bank) => (
                  <option key={bank._id} value={bank._id}>
                    {bank.bankName}
                  </option>
                ))}
              </select>
            </div>

            {selectedBank && (
              <div
                className="p-3 rounded-lg shadow-sm border text-sm"
                style={{
                  background: "var(--secondary-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
              >
                <p>
                  <strong>Account Name:</strong>{" "}
                  {selectedBank.accountHolder}
                </p>
                <p>
                  <strong>Account Number:</strong> {selectedBank.accountNumber}
                </p>
              </div>
            )}

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Your Account Name
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                className="w-full rounded-lg px-3 py-2"
                style={{
                  background: "var(--secondary-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Transaction ID
              </label>
              <input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                className="w-full rounded-lg px-3 py-2"
                style={{
                  background: "var(--secondary-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
                required
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 disabled:opacity-50"
          style={{
            background: "var(--primary-color)",
            color: "var(--foreground)",
          }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
