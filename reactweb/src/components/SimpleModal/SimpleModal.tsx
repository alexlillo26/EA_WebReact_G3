import React from "react";
import "./SimpleModal.css";
import { useLanguage } from "../../context/LanguageContext";

const SimpleModal = ({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message: string;
}) => {
  const { t } = useLanguage();
  if (!open) return null;
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose}>{t("closeButton")}</button>
      </div>
    </div>
  );
};

export default SimpleModal;
