import React, { useState } from "react";
import { RatingStars } from "../RatingStars/RatingStars";
import "./RatingModal.css";
import { useLanguage } from "../../context/LanguageContext";

export const RatingModal = ({
  open,
  onClose,
  onSubmit,
  opponentName,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: {
    punctuality: number;
    attitude: number;
    intensity: number;
    sportmanship: number;
    technique: number;
    comment: string;
  }) => void;
  opponentName: string;
}) => {
  const { t } = useLanguage();
  const [punctuality, setPunctuality] = useState(0);
  const [attitude, setAttitude] = useState(0);
  const [intensity, setIntensity] = useState(0);
  const [sportmanship, setSportmanship] = useState(0);
  const [technique, setTechnique] = useState(0);
  const [comment, setComment] = useState("");

  const canSubmit =
    punctuality > 0 &&
    attitude > 0 &&
    intensity > 0 &&
    sportmanship > 0 &&
    technique > 0;

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content">
        <h3>
          {t("rateOpponent")} {opponentName}
        </h3>
        <div>
          <label>{t("punctuality")}:</label>
          <RatingStars value={punctuality} onChange={setPunctuality} />
        </div>
        <div>
          <label>{t("attitude")}:</label>
          <RatingStars value={attitude} onChange={setAttitude} />
        </div>
        <div>
          <label>{t("intensity")}:</label>
          <RatingStars value={intensity} onChange={setIntensity} />
        </div>
        <div>
          <label>{t("sportmanship")}:</label>
          <RatingStars value={sportmanship} onChange={setSportmanship} />
        </div>
        <div>
          <label>{t("technique")}:</label>
          <RatingStars value={technique} onChange={setTechnique} />
        </div>
        <textarea
          placeholder={t("commentPlaceholder")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          style={{ width: "100%", margin: "10px 0" }}
        />
        <button
          onClick={() =>
            canSubmit &&
            onSubmit({
              punctuality,
              attitude,
              intensity,
              sportmanship,
              technique,
              comment,
            })
          }
          disabled={!canSubmit}
        >
          {t("sendButton")}
        </button>
        <button onClick={onClose} style={{ marginLeft: 10 }}>
          {t("cancelButton")}
        </button>
      </div>
    </div>
  );
};
