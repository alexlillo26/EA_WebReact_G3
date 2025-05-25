import React, { useState } from "react";
import { RatingStars } from "../RatingStars/RatingStars";
import "./RatingModal.css";

export const RatingModal = ({
  open,
  onClose,
  onSubmit,
  opponentName,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (score: number, comment: string) => void;
  opponentName: string;
}) => {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content">
        <h3>Califica a {opponentName}</h3>
        <RatingStars value={score} onChange={setScore} />
        <textarea
          placeholder="Deja un comentario (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          style={{ width: "100%", margin: "10px 0" }}
        />
        <button
          onClick={() => score > 0 && onSubmit(score, comment)}
          disabled={score === 0}
        >
          Enviar
        </button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>
          Cancelar
        </button>
      </div>
    </div>
  );
};
