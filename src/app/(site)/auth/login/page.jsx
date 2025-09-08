"use client";

import api from "@/utils/axios";
import { useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";

import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/login", {
        email,
        password,
      });

      const accessToken = res.data.data.accessToken;
      localStorage.setItem("accessToken", accessToken);

      toast.success("Login successful!");
      window.location.href = "/dashboard";
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false); // ✅ ensures it hides in both success & error
    }
  };

  return (
    <>
      {loading && <Loader />} {/* ✅ Show loader during request */}
      <main
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <div
          className="w-full max-w-md p-8 rounded-xl shadow-md"
          style={{
            backgroundColor: "var(--card-background)",
            border: "1px solid var(--border-color)",
          }}
        >
          <h1
            className="text-3xl font-bold mb-6 text-center"
            style={{ color: "var(--accent-color)" }}
          >
            Login to Tourney Tech
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--foreground)",
                  borderColor: "var(--border-color)",
                  caretColor: "var(--accent-color)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--foreground)",
                  borderColor: "var(--border-color)",
                  caretColor: "var(--accent-color)",
                }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-md font-semibold transition"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "var(--secondary-color)",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--accent-hover)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--accent-color)")
              }
              disabled={loading} // 🟡 Optional: disable button while loading
            >
              {loading ? "Signing in..." : "Sign In"}{" "}
              {/* 🟡 Optional text change */}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#9CA3AF" }}>
            Don’t have an account?{" "}
            <Link href="/auth/signup">
              <span
                className="hover:underline"
                style={{ color: "var(--accent-color)" }}
              >
                Sign Up
              </span>
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
