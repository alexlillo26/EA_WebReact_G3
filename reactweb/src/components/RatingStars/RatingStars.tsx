import React from "react";

export const RatingStars = ({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
}) => (
  <span>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        style={{
          color: star <= value ? "#FFD700" : "#ccc",
          cursor: readOnly ? "default" : "pointer",
          fontSize: "1.3em",
        }}
        onClick={
          readOnly || !onChange
            ? undefined
            : () => onChange(Number(star))
        }
        data-testid={`star-${star}`}
      >
        ★
      </span>
    ))}
  </span>
);
