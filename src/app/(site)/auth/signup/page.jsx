"use client";

import api from "@/utils/axios";
import { useState } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";

import { toast } from "react-hot-toast";

import CitySelector from "@/components/ui/signup/CitySelector";

export default function SignUpPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !username ||
      !password ||
      !city ||
      !stateCode ||
      !dob
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const data = {
      firstname: firstName,
      lastname: lastName,
      email,
      username,
      password,
      dob,
      city,
      stateCode,
      phone,
      gender,
    };

    try {
      setLoading(true);

      const res = await api.post("/api/register", data);

      toast.success("Account created!");
      window.location.href = "/auth/login";
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />} {/* Show loader while processing */}
      <main
        className="min-h-screen flex items-center justify-center px-4 py-6"
        style={{
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <div
          className="w-full max-w-2xl p-8 rounded-xl shadow-md"
          style={{ backgroundColor: "var(--card-background)" }}
        >
          <h1
            className="text-3xl font-bold mb-6 text-center"
            style={{ color: "var(--accent-color)" }}
          >
            Create Your Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={firstName}
                onChange={setFirstName}
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={setLastName}
              />
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nickname" value={username} onChange={setUsername} />
              <Input
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
              />
            </div>

            {/* Password & DOB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                value={password}
                onChange={setPassword}
                type="password"
              />
              <Input
                label="Date of Birth"
                value={dob}
                onChange={setDob}
                type="date"
              />
            </div>

            {/* Phone & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Phone" value={phone} onChange={setPhone} />

            <div className="">
                <label className="block mb-2 text-sm font-medium">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-md border"
                style={{
                  backgroundColor: "var(--secondary-color)",
                  borderColor: "var(--border-color)",
                  color: "var(--foreground)",
                }}
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
              {/* <Input label="City" value={city} onChange={setCity} /> */}
            </div>

            {/* State Code & Gender */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
              <CitySelector
                stateCode={stateCode}
                setStateCode={setStateCode}
                city={city}
                setCity={setCity}
              />
              {/* <Input
                label="State Code"
                value={stateCode}
                onChange={setStateCode}
              /> */}
              
            {/* </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md font-semibold transition"
              style={{
                backgroundColor: "var(--accent-color)",
                color: "var(--background)",
              }}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#9CA3AF" }}>
            Already have an account?{" "}
            <Link
              href="login"
              className="hover:underline"
              style={{ color: "var(--accent-color)" }}
            >
              Log In
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

// 🔧 Reusable Input Component
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        required
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-md border"
        style={{
          backgroundColor: "var(--secondary-color)",
          borderColor: "var(--border-color)",
          color: "var(--foreground)",
        }}
      />
    </div>
  );
}
