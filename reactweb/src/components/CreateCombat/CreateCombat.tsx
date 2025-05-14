import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateCombat.css";
import { useLanguage } from "../../context/LanguageContext";

const CreateCombat: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { creator, opponent } = location.state || {}; // Datos pasados desde SearchResults

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gym, setGym] = useState("");

  const handleCreateCombat = () => {
    if (!date || !time || !gym) {
      alert(t("fillAllFields"));
      return;
    }

    // Aquí puedes enviar los datos al backend si es necesario
    console.log("Combate creado:", { creator, opponent, date, time, gym });

    alert(t("combatCreated"));
    navigate("/"); // Redirige a la página principal o a otra página
  };

  return (
    <div className="create-combat-container">
      <h2>{t("createCombatTitle")}</h2>
      <div className="combat-info">
        <p>
          <strong>{t("creatorLabel")}:</strong> {creator}
        </p>
        <p>
          <strong>{t("opponentLabel")}:</strong> {opponent}
        </p>
      </div>
      <form className="combat-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          {t("dateLabel")}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          {t("timeLabel")}
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
        <label>
          {t("gymLabel")}
          <input
            type="text"
            placeholder={t("gymPlaceholder")}
            value={gym}
            onChange={(e) => setGym(e.target.value)}
          />
        </label>
        <button type="button" onClick={handleCreateCombat}>
          {t("createCombatButton")}
        </button>
      </form>
    </div>
  );
};

export default CreateCombat;
