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
  <div
    style={{
      fontSize: "2em",
      color: "#d62828",
      cursor: readOnly ? "default" : "pointer",
    }}
  >
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        onClick={() => !readOnly && onChange && onChange(star)}
        style={{ opacity: value >= star ? 1 : 0.3, marginRight: 2 }}
        data-testid={`star-${star}`}
      >
        ★
      </span>
    ))}
  </div>
);
