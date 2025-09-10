"use client";
import { useState } from "react";

export default function GameRegistrationForm() {
  const games = [
    { value: "game1", label: "Game 1", price: 500 },
    { value: "game2", label: "Game 2", price: 750 },
    { value: "game3", label: "Game 3", price: 1000 },
  ];

  // Admin bank accounts list
  const bankAccounts = [
    {
      value: "easypaisa",
      label: "Easypaisa",
      accountName: "Admin Easypaisa",
      accountNumber: "0300-1234567",
    },
    {
      value: "jazzcash",
      label: "JazzCash",
      accountName: "Admin JazzCash",
      accountNumber: "0301-7654321",
    },
    {
      value: "bank",
      label: "Bank",
      accountName: "Admin Bank",
      accountNumber: "1234-5678-9012-3456",
    },
  ];

  const [formData, setFormData] = useState({
    game: "",
    paymentType: "",
    bankAccount: "",
    transactionId: "",
    accountName: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
  };

  const selectedGame = games.find((g) => g.value === formData.game);
  const selectedBank = bankAccounts.find(
    (b) => b.value === formData.bankAccount
  );

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
        {/* Select Game */}
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
            className="w-full rounded-lg px-3 py-2"
            style={{
              background: "var(--secondary-color)",
              borderColor: "var(--border-color)",
              color: "var(--foreground)",
            }}
            required
          >
            <option value="">-- Select Game --</option>
            {games.map((game) => (
              <option key={game.value} value={game.value}>
                {game.label}
              </option>
            ))}
          </select>

          {/* Show Game Price */}
          {selectedGame && (
            <p
              className="mt-2 text-sm font-semibold"
              style={{ color: "var(--accent-color)" }}
            >
              Price: {selectedGame.price} PKR
            </p>
          )}
        </div>

        {/* Select Payment Type */}
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
            className="w-full rounded-lg px-3 py-2"
            style={{
              background: "var(--secondary-color)",
              borderColor: "var(--border-color)",
              color: "var(--foreground)",
            }}
            required
          >
            <option value="">-- Select Payment Type --</option>
            <option value="online">Online</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        {/* Online Payment Options */}
        {formData.paymentType === "online" && (
          <div className="space-y-4">
            {/* Bank Account Selection */}
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
                className="w-full rounded-lg px-3 py-2"
                style={{
                  background: "var(--secondary-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
                required
              >
                <option value="">-- Select Bank Account --</option>
                {bankAccounts.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {bank.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Show Admin Bank Details */}
            {selectedBank && (
              <div className="p-3 rounded-lg shadow-sm border text-sm"
                style={{
                  background: "var(--secondary-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}>
                <p>
                  <strong>Admin Account Name:</strong> {selectedBank.accountName}
                </p>
                <p>
                  <strong>Account Number:</strong> {selectedBank.accountNumber}
                </p>
              </div>
            )}

            {/* User Account Name */}
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

            {/* Transaction ID */}
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

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
          style={{
            background: "var(--primary-color)",
            color: "var(--foreground)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "var(--primary-hover)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "var(--primary-color)")
          }
        >
          Register
        </button>
      </form>
    </div>
  );
}
