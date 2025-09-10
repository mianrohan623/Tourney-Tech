"use client";
import { useState } from "react";

export default function BankDetailsForm() {
  const [showForm, setShowForm] = useState(false);
  const [bankData, setBankData] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  const handleChange = (e) => {
    setBankData({
      ...bankData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Admin Bank Details Submitted:", bankData);
    // TODO: Send data to API to save in DB
    setShowForm(false);
    setBankData({ bankName: "", accountName: "", accountNumber: "" });
  };

  const handleCancel = () => {
    setShowForm(false);
    setBankData({ bankName: "", accountName: "", accountNumber: "" });
  };

  return (
    <>
      {/* Toggle Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--accent-color)]">
          Bank Details
        </h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-4  font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
            style={{
              background: "var(--accent-color)",
              color: "black",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "var(--primary-hover)")(
                (e.currentTarget.style.color = "white")
              )
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "var(--accent-color)")(
                (e.currentTarget.style.color = "black")
              )
            }
          >
            + Add Bank Details
          </button>
        )}
      </div>
      <div className="max-w-lg mx-auto mb-8">
        {/* Bank Form */}
        {showForm && (
          <div
            className="rounded-2xl p-8 shadow-lg border"
            style={{
              background: "var(--card-background)",
              borderColor: "var(--border-color)",
            }}
          >
            <h2
              className="text-2xl font-bold text-center mb-6"
              style={{ color: "var(--accent-color)" }}
            >
              Admin Bank Setup
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Bank Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={bankData.bankName}
                  onChange={handleChange}
                  className="w-full rounded-lg px-3 py-2"
                  style={{
                    background: "var(--secondary-color)",
                    borderColor: "var(--border-color)",
                    color: "var(--foreground)",
                  }}
                  placeholder="e.g. Easypaisa, JazzCash, Meezan Bank"
                  required
                />
              </div>

              {/* Account Holder Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={bankData.accountName}
                  onChange={handleChange}
                  className="w-full rounded-lg px-3 py-2"
                  style={{
                    background: "var(--secondary-color)",
                    borderColor: "var(--border-color)",
                    color: "var(--foreground)",
                  }}
                  placeholder="e.g. Admin Name"
                  required
                />
              </div>

              {/* Account Number */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={bankData.accountNumber}
                  onChange={handleChange}
                  className="w-full rounded-lg px-3 py-2"
                  style={{
                    background: "var(--secondary-color)",
                    borderColor: "var(--border-color)",
                    color: "var(--foreground)",
                  }}
                  placeholder="e.g. 0300-1234567 or IBAN"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
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
                  Save
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                  style={{
                    background: "var(--error-color)",
                    color: "var(--foreground)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
