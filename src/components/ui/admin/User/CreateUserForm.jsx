"use client";

import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { toast } from "react-hot-toast";
import CitySelector from "../../signup/CitySelector";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function UserForm({ user = null, onSuccess }) {
  const isEdit = !!user;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    phone: "",
    gender: "",
    city: "",
    subCity: "", // ✅ new
    stateCode: "",
    club: "", // ✅ new
    dob: "",
    role: "player",
    password: "",
  });

  // Prefill form if editing
  useEffect(() => {
    if (isEdit && user) {
      setForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        username: user.username || "",
        phone: user.phone || "",
        gender: user.gender || "",
        city: user.city || "",
        subCity: user.subCity || "", // ✅ new
        stateCode: user.stateCode || "",
        club: user.club || "", // ✅ new
        dob: user.dob || "",
        role: user.role || "player",
        password: "",
      });
    }
  }, [isEdit, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (isEdit && key === "password" && !value) return; // ✅ skip empty password on edit
      fd.append(key, value);
    });
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload = { ...form };

      // 🔥 Ensure all string fields are actually strings (not arrays)
      Object.keys(payload).forEach((key) => {
        if (Array.isArray(payload[key])) {
          payload[key] = payload[key][0] || "";
        }
      });

      let res;

      if (isEdit) {
        if (!payload.password) delete payload.password;

        res = await api.patch(`/api/user/${user._id}`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        res = await api.post("/api/create-user", payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      toast.success(
        res.data.message || (isEdit ? "User updated!" : "User created!")
      );

      if (!isEdit) {
        setForm({
          firstname: "",
          lastname: "",
          email: "",
          username: "",
          phone: "",
          gender: "",
          city: "",
          stateCode: "",
          dob: "",
          role: "player",
          password: "",
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="rounded-2xl p-8 shadow-lg border border-[var(--border-color)] bg-[var(--card-background)]">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          {isEdit ? "Edit User" : "Create New User"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {/* First Name */}
          <InputField
            label="First Name"
            name="firstname"
            value={form.firstname}
            onChange={handleChange}
          />

          {/* Last Name */}
          <InputField
            label="Last Name"
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
          />

          {/* Email */}
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
            title="Please enter a valid email address"
          />

          {/* Username */}
          <InputField
            label="Nick name"
            name="username"
            value={form.username}
            onChange={handleChange}
          />

          {/* Phone */}
          <InputField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            pattern="\d{10}"
            maxLength="10"
            title="Phone number must be exactly 10 digits"
          />

          {/* Gender */}
          <div className="flex flex-col">
            <label className="text-sm text-muted-foreground mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="py-2 px-4 rounded-lg bg-[var(--secondary-color)] text-foreground border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* City & State */}
          <div className="sm:col-span-2">
            <CitySelector
              city={form.city}
              setCity={(val) => setForm((prev) => ({ ...prev, city: val }))}
              subCity={form.subCity}
              setSubCity={(val) =>
                setForm((prev) => ({ ...prev, subCity: val }))
              }
              stateCode={form.stateCode}
              setStateCode={(val) =>
                setForm((prev) => ({ ...prev, stateCode: val }))
              }
              club={form.club}
              setClub={(val) => setForm((prev) => ({ ...prev, club: val }))}
            />
          </div>

          {/* Date of Birth */}
          {/* <InputField
            label="Date of Birth"
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
          /> */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Date of Birth
            </label>
            <DatePicker
              selected={
                form.dob
                  ? (() => {
                      const [month, day] = form.dob.split("/");
                      const d = new Date();
                      d.setMonth(month - 1);
                      d.setDate(day);
                      return d;
                    })()
                  : null
              }
              onChange={(date) => {
                if (date instanceof Date && !isNaN(date)) {
                  const formatted = `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
                    date.getDate()
                  ).padStart(2, "0")}`;
                  setForm((prev) => ({ ...prev, dob: formatted })); // ✅ correctly update form.dob
                }
              }}
              dateFormat="MM/dd"
              showMonthDropdown
              showDayDropdown
              showYearDropdown={false} // 🚫 disable year
              placeholderText="Select month and day"
              className="w-full px-4 py-2 rounded-md border focus:outline-none"
              style={{
                backgroundColor: "var(--secondary-color)",
                borderColor: "var(--border-color)",
                color: "var(--foreground)",
              }}
              calendarClassName="custom-calendar"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col">
            <label className="text-sm text-muted-foreground mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="py-2 px-4 rounded-lg bg-[var(--secondary-color)] text-foreground border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            >
              <option value="player">Player</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* ✅ Password Field */}
          <InputField
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />

          {/* Submit */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white transition-all duration-200 disabled:opacity-60"
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                  ? "Update User"
                  : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Reusable Input */
function InputField({ label, type = "text", name, value, onChange, ...rest }) {
  return (
    <div className="flex flex-col">
      <label className="text-sm text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={name !== "password" && name !== "username"} // ✅ password optional on edit
        className="px-4 py-1.5 rounded-lg bg-[var(--secondary-color)] text-foreground border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        {...rest} // ✅ allows custom validation props
      />
    </div>
  );
}
