import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CreateCombat.css";
import { useLanguage } from "../../context/LanguageContext";
import { getGyms } from "../../services/gymService";
import { Gym } from "../../models/Gym";

const CreateCombat: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { creator, opponent } = location.state || {}; // Datos pasados desde SearchResults

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [gym, setGym] = useState("");
  const [level, setLevel] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [showAllGyms, setShowAllGyms] = useState(false);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const { gyms } = await getGyms(1, 50); // Trae hasta 100 gimnasios
        setGyms(gyms);
        console.log("Gyms fetched:", gyms);
      } catch (error) {
        console.error("Error al obtener los gimnasios:", error);
      }
    };
    fetchGyms();
  }, []);

  const filteredGyms = gyms.filter((g) =>
    g.name.toLowerCase().includes(gym.toLowerCase())
  );

  const handleCreateCombat = () => {
    if (!date || !time || !gym || !level) {
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
        <p className="combat-info-creator">
          <strong>{t("creatorLabel")}:</strong> {creator}
        </p>
        <p className="combat-info-opponent">
          <strong>{t("opponentLabel")}:</strong> {opponent}
        </p>
      </div>
      <form className="combat-form" onSubmit={(e) => e.preventDefault()}>
        <label>
          {t("levelLabel")}
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">{t("searchLevelPlaceholder")}</option>
            <option value="amateur">{t("amateur")}</option>
            <option value="professional">{t("professional")}</option>
          </select>
        </label>
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
          <div className="gym-input-row">
            <input
              type="text"
              placeholder={t("gymPlaceholder")}
              value={gym}
              onChange={(e) => {
                setGym(e.target.value);
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              onFocus={() => setShowSuggestions(true)}
              autoComplete="off"
            />
            <button
              type="button"
              className="see-gyms-btn"
              onClick={() => setShowAllGyms((prev) => !prev)}
            >
              {showAllGyms ? t("hideGyms") : t("seeGyms")}
            </button>
          </div>
          {showSuggestions && gym && filteredGyms.length > 0 && (
            <ul className="gym-suggestions">
              {filteredGyms.map((g) => (
                <li
                  key={g.id}
                  onMouseDown={() => {
                    setGym(g.name);
                    setShowSuggestions(false);
                  }}
                >
                  {g.name}
                </li>
              ))}
            </ul>
          )}
        </label>
        {showAllGyms && (
          <div className="all-gyms-grid">
            {gyms.map((g) => (
              <div
                key={g.id}
                className="gym-grid-item"
                onMouseDown={() => {
                  setGym(g.name);
                  setShowAllGyms(false);
                }}
              >
                <img src="/logo.png" alt={g.name} className="gym-img" />
                <div className="gym-name">{g.name}</div>
                <div className="gym-location">
                  {g.place || "Ubicación no disponible"}
                </div>
              </div>
            ))}
          </div>
        )}
        <button
          className="combat-form-confirm"
          type="submit"
          onClick={handleCreateCombat}
        >
          {t("createCombatButton")}
        </button>
        <button
          className="combat-form-cancel"
          type="button"
          onClick={() => navigate("/search-results")}
        >
          {t("cancelButton")}
        </button>
      </form>
    </div>
  );
};

export default CreateCombat;
