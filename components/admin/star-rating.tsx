"use client";

import { useState } from "react";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function StarRating({ value, onChange }: Props) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex text-2xl leading-none">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.max(0, Math.min(1, display - (star - 1)));

          return (
            <span key={star} className="relative inline-block">
              <span className="text-slate-600">★</span>
              <span
                className="absolute inset-0 overflow-hidden text-amber-400"
                style={{ width: `${fill * 100}%` }}
              >
                ★
              </span>

              <button
                type="button"
                className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer"
                onMouseEnter={() => setHover(star - 0.5)}
                onMouseLeave={() => setHover(0)}
                onClick={() => onChange(star - 0.5)}
                aria-label={`${star - 0.5} estrellas`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => onChange(star)}
                aria-label={`${star} estrellas`}
              />
            </span>
          );
        })}
      </div>

      <span className="text-sm text-slate-400">
        {value > 0 ? `${value}/5` : "Sin puntaje"}
      </span>
    </div>
  );
}
