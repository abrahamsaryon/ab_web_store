"use client";
import { Star } from "lucide-react";

export default function StarRating({ rating, max = 5, size = 18, interactive = false, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
          onClick={() => interactive && onChange && onChange(i + 1)}
        />
      ))}
    </div>
  );
}
