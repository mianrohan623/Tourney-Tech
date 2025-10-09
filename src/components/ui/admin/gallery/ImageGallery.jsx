"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { Loader2 } from "lucide-react";

export default function ImageGallery({ refreshTrigger }) {
  const [images, setImages] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12); // 👈 show first 4
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, [refreshTrigger]);

  const fetchImages = async () => {
    try {
      const res = await api.get("/api/image-gallery");
      setImages(res.data.data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 12); // 👈 show next  images
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[var(--accent-color)]" size={40} />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        No images found in the gallery.
      </div>
    );
  }

  return (
    <div className="">
      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.slice(0, visibleCount).map((item) => (
          <div
            key={item._id}
            className="bg-[var(--card-background)] border border-[var(--border-color)] rounded-2xl shadow-lg hover:shadow-[0_0_15px_var(--border-color)] hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-3 text-center">
              <p className="text-lg font-semibold text-[var(--foreground)] truncate">
                {item.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* View More Button */}
      {visibleCount < images.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleViewMore}
            className="px-6 py-2 rounded-lg bg-[var(--accent-color)] text-[var(--background)] font-semibold hover:bg-[var(--accent-hover)] transition"
          >
            View More
          </button>
        </div>
      )}
    </div>
  );
}
