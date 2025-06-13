import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const CANCEL_REASONS = [
  "cancelReason.injury",
  "cancelReason.personal",
  "cancelReason.cannotAttend",
  "cancelReason.other",
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
  const { t } = useLanguage();
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  if (!open) return null;

  const isOther = reason === t("cancelReason.other");
  const canConfirm = isOther ? customReason.trim().length > 0 : !!reason;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{t("cancelReason.title")}</h3>
        <select
          className="cancel-reason-select"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">{t("cancelReason.select")}</option>
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
            placeholder={t("cancelReason.write")}
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
            {t("cancelReason.confirm")}
          </button>
          <button onClick={onClose} style={{ marginLeft: 8 }}>
            {t("cancelReason.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
