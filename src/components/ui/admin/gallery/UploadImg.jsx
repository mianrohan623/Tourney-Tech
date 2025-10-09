"use client";

import React, { useState } from "react";

const UploadImg = () => {
  const [fileName, setFileName] = useState("No file chosen");
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[var(--card-background)] shadow-md">
        <h1 className="text-2xl font-bold text-[var(--accent-color)] mb-6 text-center">
          Upload Image
        </h1>

        {/* Name Input */}
        <div className="mb-5">
          <label className="block mb-2 text-sm font-semibold text-[var(--foreground)]">
            Name
          </label>
          <input
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
          <p className="text-sm text-[var(--foreground)] mt-2 italic">{fileName}</p>
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

        {/* Submit Button */}
        <button
          className="w-full mt-6 py-2.5 rounded-lg bg-[var(--accent-color)] text-[var(--background)] font-semibold hover:bg-[var(--accent-hover)] transition"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default UploadImg;
