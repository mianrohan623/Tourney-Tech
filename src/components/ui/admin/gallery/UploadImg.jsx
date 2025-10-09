"use client";

import api from "@/utils/axios";
import React, { useState } from "react";
import toast from "react-hot-toast";

const UploadImg = ({ open, setOpen, onSuccess }) => {
  const [fileName, setFileName] = useState("No file chosen");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [iconImage, setIconImage] = useState(null);
  const [name, setName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setIconImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!name.trim() || !iconImage) {
      toast.error("Please enter a name and select an image.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("iconImage", iconImage);
      formData.append("name", name);

      const response = await api.post("/api/image-gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // ✅ Trigger refresh in parent component
      if (response.status === 201 || response.status === 200) {
        onSuccess && onSuccess();
      }

      // ✅ Reset form fields
      setName("");
      setIconImage(null);
      setFileName("No file chosen");
      setPreview(null);
      setOpen(false);

      toast.success("Image uploaded successfully");
    } catch (error) {
      console.log("Error:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      {open && (
        <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--card-background)] shadow-md mb-8">
          <h1 className="text-2xl font-bold text-[var(--accent-color)] mb-6 text-center">
            Upload Image
          </h1>

          {/* Name Input */}
          <div className="mb-5">
            <label className="block mb-2 text-sm font-semibold text-[var(--foreground)]">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter image name..."
              className="w-full p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--secondary-color)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition"
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer border-[var(--border-color)] hover:border-[var(--accent-color)] hover:bg-[var(--card-hover)] transition">
              <span className="text-[var(--accent-color)] font-medium">
                Click to upload or drag & drop
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-sm text-[var(--foreground)] mt-2 italic">
              {fileName}
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Preview"
                className="rounded-lg border border-[var(--border-color)] max-h-60 object-cover w-full"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-4 items-center">
            <button
              className="w-1/2 py-2.5 rounded-lg bg-[var(--border-color)] text-white font-semibold transition cursor-pointer"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              onClick={handleUpload}
              disabled={loading}
              className="w-1/2 py-2.5 rounded-lg bg-[var(--accent-color)] text-[var(--background)] font-semibold hover:bg-[var(--accent-hover)] transition cursor-pointer"
            >
              {loading ? "Loading..." : "Upload"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadImg;
