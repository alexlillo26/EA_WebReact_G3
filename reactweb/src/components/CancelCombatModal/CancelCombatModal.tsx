import React, { useState } from "react";

const CANCEL_REASONS = [
  "Lesión",
  "Problemas personales",
  "No puedo asistir",
  "Otro",
];

export const CancelCombatModal = ({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) => {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  if (!open) return null;

  const isOther = reason === "Otro";
  const canConfirm = isOther ? customReason.trim().length > 0 : !!reason;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>¿Por qué quieres cancelar el combate?</h3>
        <select
          className="cancel-reason-select"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">Selecciona un motivo</option>
          {CANCEL_REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        {isOther && (
          <input
            className="cancel-reason-input"
            type="text"
            placeholder="Escribe el motivo"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        )}
        <div style={{ marginTop: 16 }}>
          <button
            disabled={!canConfirm}
            onClick={() => {
              onConfirm(isOther ? customReason : reason);
              setReason("");
              setCustomReason("");
            }}
          >
            Confirmar cancelación
          </button>
          <button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
